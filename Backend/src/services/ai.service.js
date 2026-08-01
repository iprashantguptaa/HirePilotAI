const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

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

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return { data: JSON.parse(response.text), usage: extractUsage(response) }


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

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

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

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
            systemInstruction
        }
    })

    return { text: response.text, usage: extractUsage(response) }
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml, generateChatReply }