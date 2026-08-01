import api from "../../../lib/apiClient"

export const submitFeedback = async (payload) => {
    const response = await api.post("/api/feedback", payload)
    return response.data
}
