import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, generateReportPdf } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    const apiMessage = error?.response?.data?.message
    if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage

    const status = error?.response?.status
    const body = error?.response?.data
    const looksLikeHtml = typeof body === "string" && /<!DOCTYPE|<html/i.test(body)

    if (status === 502 || status === 503 || status === 504 || looksLikeHtml) {
        return "The server timed out while generating your report. Please try again in a minute."
    }

    if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
        return "The AI took too long to respond. Please try again in a minute."
    }

    if (error?.message === "Network Error" || !error?.response) {
        return "Can't reach the server. Check that the backend is running, then try again."
    }

    return fallback
}

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const toast = useToast()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't generate your interview report. Please try again."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            setReport(null)
            toast?.error(getErrorMessage(error, "Couldn't load that interview report."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const list = Array.isArray(response?.interviewReports) ? response.interviewReports : []
            setReports(list)
            return list
        } catch (error) {
            setReports([])
            toast?.error(getErrorMessage(error, "Couldn't load your interview history."))
            // Returning null (not []) lets callers tell a failed load from an empty history.
            return null
        } finally {
            setLoading(false)
        }
    }

    function downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(new Blob([ blob ], { type: "application/pdf" }))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            downloadBlob(response, `resume_${interviewReportId}.pdf`)
        }
        catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't generate the resume PDF."))
        } finally {
            setLoading(false)
        }
    }

    const getReportPdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateReportPdf({ interviewReportId })
            downloadBlob(response, `interview_report_${interviewReportId}.pdf`)
        }
        catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't generate the report PDF."))
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        report,
        reports: Array.isArray(reports) ? reports : [],
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
        getReportPdf
    }

}
