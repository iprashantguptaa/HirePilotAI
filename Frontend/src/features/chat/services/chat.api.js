import api from "../../../lib/apiClient"

/**
 * @description Fetch (or lazily create) the AI Assistant conversation for a specific interview report.
 */
export const getConversation = async (interviewId) => {
    const response = await api.get(`/api/chat/${interviewId}`)
    return response.data
}

/**
 * @description Send a message to the AI Interview Assistant and get a reply.
 */
export const sendChatMessage = async (interviewId, message) => {
    const response = await api.post(`/api/chat/${interviewId}/message`, { message })
    return response.data
}
