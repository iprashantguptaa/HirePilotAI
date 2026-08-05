import api from "../../../lib/apiClient"

/**
 * @description Start a live practice interview session. Resolves with the session
 * and its first question already generated.
 */
export const startSession = async ({ interviewReportId, jobDescription, title, mode, plannedQuestions }) => {
    const response = await api.post("/api/session", {
        interviewReportId,
        jobDescription,
        title,
        mode,
        plannedQuestions
    })
    return response.data
}

/**
 * @description Submit an answer to the session's current question. Resolves with the
 * score for that answer plus the next question (or null if the session just ended).
 */
export const submitAnswer = async (sessionId, answer) => {
    // Scoring + next-question generation are two AI calls; 60s is too short
    // when the provider is slow and left candidates stuck after question 1.
    const response = await api.post(
        `/api/session/${sessionId}/answer`,
        { answer },
        { timeout: 180000 }
    )
    return response.data
}

/**
 * @description End a session early and generate its report from what was answered.
 */
export const completeSession = async (sessionId) => {
    const response = await api.post(`/api/session/${sessionId}/complete`)
    return response.data
}

/**
 * @description Fetch a single session including its full transcript.
 */
export const getSession = async (sessionId) => {
    // May trigger next-question generation (self-heal) — allow longer wait.
    const response = await api.get(`/api/session/${sessionId}`, { timeout: 120000 })
    return response.data
}

/**
 * @description List the logged-in user's practice sessions.
 */
export const getSessions = async () => {
    const response = await api.get("/api/session")
    return response.data
}

/**
 * @description Delete a practice session.
 */
export const deleteSession = async (sessionId) => {
    const response = await api.delete(`/api/session/${sessionId}`)
    return response.data
}
