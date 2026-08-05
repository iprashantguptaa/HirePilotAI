import api from "../../../lib/apiClient"

/**
 * @description Start a live practice interview session. Resolves with the session
 * and its first question already generated.
 * @param {object} opts
 * @param {AbortSignal} [opts.signal] - optional abort when user cancels start
 */
export const startSession = async ({
    interviewReportId,
    jobDescription,
    title,
    mode,
    plannedQuestions,
    signal
}) => {
    const response = await api.post("/api/session", {
        interviewReportId,
        jobDescription,
        title,
        mode,
        plannedQuestions
    }, {
        // First question is one AI call — allow cold-start + generation time.
        timeout: 180000,
        signal
    })
    return response.data
}

/**
 * @description Submit an answer for scoring. The next question is loaded on
 * Continue (separate request) so feedback appears as soon as scoring finishes.
 */
export const submitAnswer = async (sessionId, answer) => {
    const response = await api.post(
        `/api/session/${sessionId}/answer`,
        { answer },
        { timeout: 120000 }
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
