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
// Keep retries short — each attempt can take tens of seconds with Gemini.
const MAX_ATTEMPTS = 2
const BASE_BACKOFF_MS = 500

// Cap prompt size so huge resumes/JDs don't dominate latency.
const MAX_RESUME_CHARS = 5500
const MAX_JD_CHARS = 3500
const MAX_ANSWER_CHARS = 3500

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function clipText(value, maxChars) {
    if (!value || typeof value !== "string") return ""
    const trimmed = value.trim()
    if (trimmed.length <= maxChars) return trimmed
    return `${trimmed.slice(0, maxChars)}\n\n[truncated for speed]`
}

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


const reportProfileSchema = z.object({
    title: z.string().describe("Short job title for this interview plan"),
    matchScore: z.number().describe("Overall match score 0-100"),
    scoreBreakdown: z.object({
        technicalSkills: z.number().describe("0-100 technical/hard skills match"),
        communication: z.number().describe("0-100 communication clarity estimate"),
        experience: z.number().describe("0-100 experience relevance"),
        cultureFit: z.number().describe("0-100 culture/team fit estimate")
    }),
    strengths: z.array(z.object({
        skill: z.string(),
        note: z.string().describe("One short sentence")
    })).describe("3 to 5 strengths"),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum([ "low", "medium", "high" ])
    })).describe("3 to 6 skill gaps")
})

const reportPrepSchema = z.object({
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().describe("One short sentence"),
        answer: z.string().describe("3-5 bullet-style coaching points, keep under 80 words")
    })).describe("Exactly 5 technical questions"),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().describe("One short sentence"),
        answer: z.string().describe("3-5 bullet-style coaching points, keep under 80 words")
    })).describe("Exactly 5 behavioral questions"),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()).describe("2 to 4 short tasks")
    })).describe("Exactly 5 days")
})

function sumUsage(a = {}, b = {}) {
    return {
        promptTokens: (a.promptTokens || 0) + (b.promptTokens || 0),
        responseTokens: (a.responseTokens || 0) + (b.responseTokens || 0),
        totalTokens: (a.totalTokens || 0) + (b.totalTokens || 0)
    }
}

/**
 * Interview plan generation used to be one giant structured call (scores +
 * 2 question banks + multi-day plan). That was the main latency sink.
 * Split into two parallel smaller calls so wall-clock ≈ the slower half.
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const resumeText = clipText(resume, MAX_RESUME_CHARS)
    const selfText = clipText(selfDescription, 1500)
    const jdText = clipText(jobDescription, MAX_JD_CHARS)

    const sharedContext = `Resume:
${resumeText || "Not provided."}

Self description:
${selfText || "Not provided."}

Job description:
${jdText || "Not provided."}`

    const [ profileResult, prepResult ] = await Promise.all([
        (async () => {
            const response = await callModel({
                model: MODEL,
                contents: `Assess this candidate against the role. Be concise.\n\n${sharedContext}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(reportProfileSchema),
                    maxOutputTokens: 2048
                }
            }, "interview_report_profile")

            return {
                data: parseStructured(response, reportProfileSchema, "interview_report_profile"),
                usage: extractUsage(response)
            }
        })(),
        (async () => {
            const response = await callModel({
                model: MODEL,
                contents: `Create interview prep for this candidate. Keep coaching answers short.\n\n${sharedContext}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(reportPrepSchema),
                    maxOutputTokens: 4096
                }
            }, "interview_report_prep")

            return {
                data: parseStructured(response, reportPrepSchema, "interview_report_prep"),
                usage: extractUsage(response)
            }
        })()
    ])

    return {
        data: {
            ...profileResult.data,
            ...prepResult.data
        },
        usage: sumUsage(profileResult.usage, prepResult.usage)
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
    // Coerce common model variants ("Behavioural", "TECHNICAL") so a strict
    // enum miss doesn't fail the whole "Start interview" request.
    category: z.preprocess((value) => {
        const normalized = String(value || "").toLowerCase()
        if (normalized.startsWith("behav")) return "behavioral"
        return "technical"
    }, z.enum([ "technical", "behavioral" ])),
    intention: z.string().describe("What the interviewer is actually trying to assess with this question. Not shown to the candidate before they answer."),
    isFollowUp: z.preprocess((value) => Boolean(value), z.boolean())
})

/**
 * Picks the next question in a live session. Prior turns (with their scores)
 * are included so the model can decide between probing a weak/vague answer
 * with a follow-up and moving on to a fresh topic -- which is what makes the
 * session feel like a real interview rather than a fixed questionnaire.
 */
async function generateSessionQuestion({ resume, jobDescription, mode, priorTurns, questionNumber, plannedQuestions }) {
    // Only the last 3 turns matter for follow-up decisions — full history
    // makes every later question slower without improving quality much.
    const recentTurns = (priorTurns || []).filter((turn) => turn.answer).slice(-3)

    const transcript = recentTurns
        .map((turn) => `Q${turn.questionNumber} (${turn.category}): ${turn.question}
Answer (clipped): ${clipText(turn.answer, 500)}
Score: ${turn.overallScore ?? "n/a"}/100. Missing: ${clipText(turn.feedback?.whatWasMissing || "n/a", 220)}`)
        .join("\n\n")

    const modeInstruction = {
        technical: "This is a technical interview. Ask only technical/domain questions.",
        behavioral: "This is a behavioral interview. Ask only behavioral, situational and motivational questions.",
        mixed: "This is a mixed interview. Blend technical and behavioral questions across the session."
    }[ mode ] || "This is a mixed interview."

    const prompt = `You are conducting a live mock interview. Decide the next question to ask.

${modeInstruction}

This is question ${questionNumber} of approximately ${plannedQuestions}.

Job description:
${clipText(jobDescription, MAX_JD_CHARS) || "Not provided."}

Candidate background:
${clipText(resume, MAX_RESUME_CHARS) || "Not provided."}

${transcript ? `Recent interview so far:\n${transcript}` : "Opening question — start with something a real interviewer would open with for this role."}

Rules:
- Ask exactly ONE question. No coaching or hints in the question text.
- Ground it in this JD and candidate. Prefer a follow-up (isFollowUp=true) if the last score was below 60 or vague.
- Keep intention to one short sentence.`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(sessionQuestionSchema),
            maxOutputTokens: 512
        }
    }, "session_question")

    const data = parseStructured(response, sessionQuestionSchema, "session_question")

    return {
        data: {
            ...data,
            category: data.category === "behavioral" ? "behavioral" : "technical",
            isFollowUp: Boolean(data.isFollowUp),
            question: String(data.question || "").trim(),
            intention: String(data.intention || "").trim()
        },
        usage: extractUsage(response)
    }
}


const answerScoreSchema = z.object({
    overallScore: z.number().describe("Overall score 0-100. Average unremarkable answers land in the 50s."),
    rubric: z.object({
        relevance: z.number(),
        depth: z.number(),
        structure: z.number(),
        clarity: z.number(),
        specificity: z.number()
    }),
    feedback: z.object({
        whatWorked: z.string().describe("1-2 short sentences"),
        whatWasMissing: z.string().describe("1-2 short concrete sentences"),
        improvedAnswer: z.string().describe("A stronger spoken answer, max ~90 words. Not an essay.")
    })
})

/**
 * Grades one answer against a fixed rubric. Deliberately prompted to resist
 * grade inflation -- an encouraging-but-useless scorer would make the whole
 * practice feature worthless.
 */
async function scoreSessionAnswer({ resume, jobDescription, question, category, intention, answer }) {

    const prompt = `Score this interview answer honestly and briefly.

Job description:
${clipText(jobDescription, MAX_JD_CHARS) || "Not provided."}

Candidate background:
${clipText(resume, MAX_RESUME_CHARS) || "Not provided."}

Question (${category}): ${question}
Assessing: ${intention || "Not specified."}

Candidate answer:
"""
${clipText(answer, MAX_ANSWER_CHARS)}
"""

Rules:
- Do not inflate scores. Generic answers stay at/below 55.
- Judge depth against the seniority implied by the JD.
- Keep feedback short. improvedAnswer max ~90 words, spoken style, use only facts from their background.`

    const response = await callModel({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(answerScoreSchema),
            maxOutputTokens: 1024
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