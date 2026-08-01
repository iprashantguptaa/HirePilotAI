import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, generateReportPdf } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
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
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't load your interview history."))
            return []
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

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, getReportPdf }

}
