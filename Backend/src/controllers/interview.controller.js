const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, generatePdfFromHtml } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const userModel = require("../models/user.model")
const aiUsageLogModel = require("../models/aiUsageLog.model")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const logger = require("../utils/logger")
const { renderReportHtml } = require("../utils/reportHtmlTemplate")
const config = require("../config/env")

/**
 * Records AI token usage for the admin panel's usage dashboard. Never
 * allowed to break the actual request -- a logging failure is swallowed
 * (and noted) rather than turning a successful AI call into a 500.
 */
async function logAiUsage(userId, type, usage) {
    try {
        await aiUsageLogModel.create({
            user: userId,
            type,
            model: config.geminiModel,
            promptTokens: usage?.promptTokens || 0,
            responseTokens: usage?.responseTokens || 0,
            totalTokens: usage?.totalTokens || 0
        })
    } catch (err) {
        logger.warn(`Failed to record AI usage log: ${err.message}`)
    }
}

async function extractResumeText(file) {
    try {
        const parser = new pdfParse.PDFParse({ data: Uint8Array.from(file.buffer) })
        const parsed = await parser.getText()
        return String(parsed?.text || "").trim()
    } catch (err) {
        logger.warn(`Resume PDF parse failed: ${err.message}`)
        throw ApiError.badRequest("Couldn't read that PDF. Please upload a text-based resume PDF (not a scanned image).")
    }
}


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
const generateInterViewReportController = asyncHandler(async function generateInterViewReportController(req, res) {

    const { selfDescription, jobDescription } = req.body

    if (!jobDescription || !String(jobDescription).trim()) {
        throw ApiError.badRequest("Job description is required.")
    }

    let resumeContent = ""
    if (req.file) {
        resumeContent = await extractResumeText(req.file)
    }

    if (!resumeContent && (!selfDescription || !String(selfDescription).trim())) {
        // Reuse the resume saved on the user profile when the form left both empty.
        const profile = await userModel.findById(req.user.id).select("resume.text")
        resumeContent = profile?.resume?.text || ""
    }

    if (!resumeContent && (!selfDescription || !String(selfDescription).trim())) {
        throw ApiError.badRequest("Please provide either a resume file or a self description.")
    }

    const startedAt = Date.now()
    const { data: interViewReportByAi, usage } = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription
    })
    logger.info(`interview_report_generate latency_ms=${Date.now() - startedAt} user=${req.user.id}`)

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    await logAiUsage(req.user.id, "interview_report", usage)

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

})

/**
 * @description Controller to get interview report by interviewId.
 */
const getInterviewReportByIdController = asyncHandler(async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        throw ApiError.notFound("Interview report not found.")
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
})


/** 
 * @description Controller to get all interview reports of logged in user.
 */
const getAllInterviewReportsController = asyncHandler(async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
})


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
const generateResumePdfController = asyncHandler(async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    // Scoped to req.user.id -- previously this looked up by id alone,
    // meaning any logged-in user could generate/download another user's
    // tailored resume PDF just by guessing/incrementing the id.
    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        throw ApiError.notFound("Interview report not found.")
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const { buffer, usage } = await generateResumePdf({ resume, jobDescription, selfDescription })
    await logAiUsage(req.user.id, "resume_pdf", usage)

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(buffer)
})

/**
 * @description Controller to download the full interview report (score breakdown, strengths,
 * skill gaps, questions, roadmap) as a PDF. Rendered from already-stored data -- no AI call.
 */
const generateReportPdfController = asyncHandler(async function generateReportPdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        throw ApiError.notFound("Interview report not found.")
    }

    const html = renderReportHtml(interviewReport)
    const pdfBuffer = await generatePdfFromHtml(html)

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=interview_report_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
})

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generateReportPdfController
}
