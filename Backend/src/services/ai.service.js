const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")
const ApiError = require("../utils/ApiError")
const logger = require("../utils/logger")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const MODEL = "gemini-3-flash-preview"

// The provider returns these when it is overloaded or rate-limiting rather
// than when the request is wrong, so they are worth retrying.
const RETRYABLE_UPSTREAM_STATUSES = new Set([ 429, 500, 502, 503, 504 ])
const MAX_ATTEMPTS = 3
const BASE_BACKOFF_MS = 800

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The GenAI SDK throws an Error whose message is the raw upstream JSON body.
 * These pull the useful parts out without depending on that shape being
 * stable -- if the format changes, we fall back to treating the failure as
 * non-retryable rather than crashing on the parse.
 */
function upstreamStatus(error) {
    if (typeof error?.status === "number") return error.status
    const match = /"code"\s*:\s*(\d+)/.exec(error?.message || "")
    return match ? Number(match[ 1 ]) : undefined
}

function upstreamMessage(error) {
    const match = /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(error?.message || "")
    return match ? match[ 1 ] : error?.message
}

/**
 * Quota exhaustion also arrives as a 429, but unlike ordinary rate limiting it
 * will not clear on a retry a second later -- the billing period has to roll
 * over or the plan has to change. Retrying it just burns time and makes the
 * request slower to fail.
 */
function isQuotaError(error) {
    return /exceeded your current quota|RESOURCE_EXHAUSTED|billing details/i.test(error?.message || "")
}

/**
 * Single entry point for every model call.
 *
 * Retries transient provider failures with exponential backoff, and converts
 * anything that still fails into an ApiError with a message safe to show a
 * user. Without this, a momentary provider 503 surfaced as a 500 containing
 * the raw provider JSON body.
 */
async function callModel(request, label) {
    let lastError

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            return await ai.models.generateContent(request)
        } catch (error) {
            lastError = error

            const status = upstreamStatus(error)
            const isRetryable = status !== undefined
                && RETRYABLE_UPSTREAM_STATUSES.has(status)
                && !isQuotaError(error)

            if (!isRetryable || attempt === MAX_ATTEMPTS) break

            const backoff = BASE_BACKOFF_MS * 2 ** (attempt - 1)
            logger.warn(`AI call "${label}" hit upstream ${status} (attempt ${attempt}/${MAX_ATTEMPTS}); retrying in ${backoff}ms`)
            await sleep(backoff)
        }
    }

    const status = upstreamStatus(lastError)
    logger.error(`AI call "${label}" failed: ${upstreamMessage(lastError)}`)

    // Distinguished from ordinary overload because the operator, not the user,
    // has to act -- and no amount of retrying by the user will help.
    if (isQuotaError(lastError)) {
        throw ApiError.serviceUnavailable(
            "Our AI service has reached its usage limit. Please try again later."
        )
    }

    if (status !== undefined && RETRYABLE_UPSTREAM_STATUSES.has(status)) {
        throw ApiError.serviceUnavailable(
            "The AI service is busy at the moment. Please try again in a few seconds."
        )
    }

    if (status === 401 || status === 403) {
        throw ApiError.internal("The AI service rejected our credentials. Please contact support.")
    }

    throw ApiError.internal(`The AI service could not complete this request: ${upstreamMessage(lastError)}`)
}

/**
 * Parses a structured (JSON mode) response and validates it against the schema
 * we asked the model for. A truncated or malformed body would otherwise be
 * written to the database as partial data.
 */
function parseStructured(response, schema, label) {
    const text = response?.text

    if (!text) {
        const finishReason = response?.candidates?.[ 0 ]?.finishReason
        logger.error(`AI call "${label}" returned no text (finishReason: ${finishReason || "unknown"})`)
        throw ApiError.serviceUnavailable(
            "The AI service returned an empty response. Please try again."
        )
    }

    let parsed
    try {
        parsed = JSON.parse(text)
    } catch {
        logger.error(`AI call "${label}" returned invalid JSON (${text.length} chars)`)
        throw ApiError.serviceUnavailable(
            "The AI service returned a malformed response. Please try again."
        )
    }

    const validated = schema.safeParse(parsed)
    if (!validated.success) {
        logger.error(`AI call "${label}" failed schema validation: ${validated.error.message}`)
        throw ApiError.serviceUnavailable(
            "The AI service returned an unexpected response. Please try again."
        )
    }

    return validated.data
}

/**
 * Reads token usage off a generateContent response. Defensive about the
 * exact field names since this is metadata, not the actual content --
 * if the SDK's shape ever shifts, usage logging degrades to zeros
 * instead of breaking the actual AI feature.
 */
function extractUsage(response) {
    const usage = response?.usageMetadata || {}
    return {
        promptTokens: usage.promptTokenCount || 0,
        responseTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0
    }
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    scoreBreakdown: z.object({
        technicalSkills: z.number().describe("Score 0-100 for how well the candidate's technical/hard skills match the job requirements"),
        communication: z.number().describe("Score 0-100 estimating the candidate's communication clarity based on their resume/self description"),
        experience: z.number().describe("Score 0-100 for how relevant and sufficient the candidate's experience is for this role"),
        cultureFit: z.number().describe("Score 0-100 estimating alignment between the candidate's background and the likely team/company culture implied by the job description")
    }).describe("A breakdown of the overall match score into contributing dimensions"),
    strengths: z.array(z.object({
        skill: z.string().describe("A skill or trait where the candidate is strong relative to this job"),
        note: z.string().describe("A short explanation of why this is a strength for this specific role")
    })).describe("The candidate's strongest points relative to this specific job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    }, "interview_report")

    return {
        data: parseStructured(response, interviewReportSchema, "interview_report"),
        usage: extractUsage(response)
    }
}



async function generatePdfFromHtml(htmlContent) {
    // --no-sandbox / --disable-setuid-sandbox are required on most
    // containerized hosts (Render, Railway, Docker) -- the sandbox needs
    // kernel privileges those environments don't grant, and Puppeteer
    // fails to launch at all without these flags there.
    const browser = await puppeteer.launch({
        args: [ "--no-sandbox", "--disable-setuid-sandbox" ]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    }, "resume_pdf")

    const jsonContent = parseStructured(response, resumePdfSchema, "resume_pdf")

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return { buffer: pdfBuffer, usage: extractUsage(response) }

}

/**
 * Generates a single assistant reply for the AI Interview Assistant chat.
 * Multi-turn: prior messages are passed as `contents` so the model has
 * real conversation memory, and resume/job-description/history context
 * is passed as a system instruction so it stays grounded in this specific
 * candidate and role rather than answering generically.
 */
async function generateChatReply({ resume, jobDescription, pastReportsSummary, history, userMessage }) {

    const systemInstruction = `You are an experienced, encouraging technical interviewer and career coach running a live mock-interview / prep chat with a candidate.

Candidate's resume / background:
${resume || "Not provided -- rely on the self description and job description below."}

Job description they are preparing for:
${jobDescription || "Not provided."}

Summary of the candidate's other recent interview prep sessions (their track record and recurring weak areas, if any):
${pastReportsSummary || "No other sessions yet."}

How to behave:
- Act like a real interviewer: ask focused follow-up questions one at a time, don't dump a list of questions at once.
- When the candidate answers a question, evaluate it honestly -- point out specifically what was missing, unclear, or incorrect, and explain how to improve it.
- Reference the candidate's actual resume and the job description when relevant, instead of generic advice.
- Keep replies conversational and reasonably concise (a few short paragraphs at most), not an essay.
- If the candidate seems to be repeating a weak area from their history above, gently call that out.`

    const contents = [
        ...history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [ { text: m.content } ]
        })),
        { role: "user", parts: [ { text: userMessage } ] }
    ]

    const response = await callModel({
        model: MODEL,
        contents,
        config: {
            systemInstruction
        }
    }, "chat_reply")

    if (!response?.text) {
        throw ApiError.serviceUnavailable("The assistant returned an empty reply. Please try again.")
    }

    return { text: response.text, usage: extractUsage(response) }
}

// ============================================================================
// LIVE PRACTICE SESSION
// ============================================================================
// Unlike generateInterviewReport (which hands the candidate questions *with*
// model answers), these drive an interactive session: ask one question, grade
// what the candidate actually said, then decide what to ask next.

const sessionQuestionSchema = z.object({
    question: z.string().describe("The single next interview question to ask the candidate. Ask exactly one question, phrased the way a real interviewer would say it out loud."),
    category: z.enum([ "technical", "behavioral" ]).describe("Whether this is a technical/domain question or a behavioral/situational question"),
    intention: z.string().describe("What the interviewer is actually trying to assess with this question. Not shown to the candidate before they answer."),
    isFollowUp: z.boolean().describe("True if this question drills deeper into the candidate's previous answer rather than opening a new topic")
})

/**
 * Picks the next question in a live session. Prior turns (with their scores)
 * are included so the model can decide between probing a weak/vague answer
 * with a follow-up and moving on to a fresh topic -- which is what makes the
 * session feel like a real interview rather than a fixed questionnaire.
 */
async function generateSessionQuestion({ resume, jobDescription, mode, priorTurns, questionNumber, plannedQuestions }) {

    const transcript = (priorTurns || [])
        .filter((turn) => turn.answer)
        .map((turn) => `Q${turn.questionNumber} (${turn.category}): ${turn.question}
Candidate answered: ${turn.answer}
Score given: ${turn.overallScore ?? "n/a"}/100. Missing: ${turn.feedback?.whatWasMissing || "n/a"}`)
        .join("\n\n")

    const modeInstruction = {
        technical: "This is a technical interview. Ask only technical/domain questions.",
        behavioral: "This is a behavioral interview. Ask only behavioral, situational and motivational questions.",
        mixed: "This is a mixed interview. Blend technical and behavioral questions across the session."
    }[ mode ] || "This is a mixed interview."

    const prompt = `You are conducting a live mock interview. Decide the next question to ask.

${modeInstruction}

This is question ${questionNumber} of approximately ${plannedQuestions}.

Job description the candidate is interviewing for:
${jobDescription || "Not provided."}

Candidate's resume / background:
${resume || "Not provided."}

${transcript ? `Interview so far:\n${transcript}` : "The interview has not started yet -- this is your opening question."}

Rules for choosing the next question:
- Ask exactly ONE question. Never bundle multiple questions together.
- Ground the question in this specific job description and this specific candidate's background. Avoid generic filler questions.
- If the candidate's last answer was vague, shallow, or scored below 60, strongly prefer a follow-up that presses them on the specific thing they left out. Set isFollowUp to true.
- If the last answer was strong, move on to a new topic and set isFollowUp to false.
- Do not repeat a topic you have already covered adequately.
- If this is the opening question, start with something reasonable an interviewer would actually open with for this role.
- Do not include the answer, hints, or coaching in the question text.`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(sessionQuestionSchema),
        }
    }, "session_question")

    return {
        data: parseStructured(response, sessionQuestionSchema, "session_question"),
        usage: extractUsage(response)
    }
}


const answerScoreSchema = z.object({
    overallScore: z.number().describe("Overall score 0-100 for this single answer. Be rigorous and honest -- an average, unremarkable answer should land in the 50s, not the 80s."),
    rubric: z.object({
        relevance: z.number().describe("0-100: did the candidate actually answer the question that was asked, or drift to something else?"),
        depth: z.number().describe("0-100: technical/substantive depth and correctness of the reasoning shown"),
        structure: z.number().describe("0-100: was the answer organised and easy to follow? For behavioural questions, reward clear situation-action-result structure."),
        clarity: z.number().describe("0-100: communication clarity and concision, free of rambling and filler"),
        specificity: z.number().describe("0-100: use of concrete examples, real numbers, and specifics from their own experience rather than generic statements")
    }).describe("Independent scores per dimension so the candidate learns which aspect of their answering is weak"),
    feedback: z.object({
        whatWorked: z.string().describe("Specifically what was good about this answer. If genuinely nothing was good, say so honestly rather than inventing praise."),
        whatWasMissing: z.string().describe("The specific points, examples, or reasoning the answer should have included but did not. Be concrete and actionable."),
        improvedAnswer: z.string().describe("A stronger version of the answer, written in the candidate's own voice using their real background. Keep it realistic in length -- what a strong candidate would actually say out loud, not an essay.")
    })
})

/**
 * Grades one answer against a fixed rubric. Deliberately prompted to resist
 * grade inflation -- an encouraging-but-useless scorer would make the whole
 * practice feature worthless.
 */
async function scoreSessionAnswer({ resume, jobDescription, question, category, intention, answer }) {

    const prompt = `You are a rigorous but fair interview assessor. Score the candidate's answer to a single interview question.

Job description:
${jobDescription || "Not provided."}

Candidate's resume / background:
${resume || "Not provided."}

Question asked (${category}): ${question}
What the interviewer was assessing: ${intention || "Not specified."}

The candidate's answer, verbatim:
"""
${answer}
"""

Scoring rules:
- Be honest. Do not inflate scores to be encouraging. A generic answer with no specifics should not score above 55 regardless of how confident it sounds.
- Score what they actually said, not what they might have meant.
- If the answer is empty, off-topic, or an admission that they don't know, score it low and say why plainly.
- Judge depth against the seniority implied by the job description.
- In the improved answer, use the candidate's real background from their resume where possible. Do not invent employers, titles, or metrics they never mentioned.`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(answerScoreSchema),
        }
    }, "session_score")

    return {
        data: parseStructured(response, answerScoreSchema, "session_score"),
        usage: extractUsage(response)
    }
}


const sessionAnalyticsSchema = z.object({
    verdict: z.string().describe("A short, honest 1-2 sentence overall assessment of how this interview went and whether the candidate would likely advance."),
    strengths: z.array(z.string()).describe("Specific things the candidate did well across the whole session, referencing actual answers"),
    weaknesses: z.array(z.string()).describe("Specific recurring problems across the session, e.g. 'consistently gave no measurable outcomes' -- reference actual answers"),
    recommendations: z.array(z.string()).describe("Concrete, actionable next steps to fix the weaknesses above before a real interview")
})

/**
 * Produces the end-of-session analytics. Numeric scores are computed in the
 * controller from the individual turns (so the maths is verifiable and
 * consistent) -- the model only supplies the qualitative narrative.
 */
async function generateSessionAnalytics({ title, jobDescription, turns }) {

    const transcript = (turns || [])
        .map((turn) => `Q${turn.questionNumber} (${turn.category}${turn.isFollowUp ? ", follow-up" : ""}): ${turn.question}
Answer: ${turn.answer}
Scored ${turn.overallScore}/100 -- relevance ${turn.rubric?.relevance}, depth ${turn.rubric?.depth}, structure ${turn.rubric?.structure}, clarity ${turn.rubric?.clarity}, specificity ${turn.rubric?.specificity}
Noted as missing: ${turn.feedback?.whatWasMissing || "n/a"}`)
        .join("\n\n")

    const prompt = `Summarise how this mock interview went for the candidate.

Role: ${title}
Job description:
${jobDescription || "Not provided."}

Full interview transcript with per-answer scores:
${transcript}

Write the summary based strictly on the transcript above. Reference specific answers rather than giving generic advice. Look for patterns that repeat across multiple answers -- those matter far more than a single weak response. Be honest about whether this performance would pass a real interview for this role.`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(sessionAnalyticsSchema),
        }
    }, "session_analytics")

    return {
        data: parseStructured(response, sessionAnalyticsSchema, "session_analytics"),
        usage: extractUsage(response)
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generatePdfFromHtml,
    generateChatReply,
    generateSessionQuestion,
    scoreSessionAnswer,
    generateSessionAnalytics
}