import api from "../../../lib/apiClient"

export const getProfile = async () => {
    const response = await api.get("/api/profile")
    return response.data
}

export const updateProfile = async (payload) => {
    const response = await api.patch("/api/profile", payload)
    return response.data
}

export const updateNotificationPreferences = async (payload) => {
    const response = await api.patch("/api/profile/notifications", payload)
    return response.data
}

export const uploadAvatar = async (file) => {
    const formData = new FormData()
    formData.append("avatar", file)
    const response = await api.post("/api/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const deleteAvatar = async () => {
    const response = await api.delete("/api/profile/avatar")
    return response.data
}

export const uploadProfileResume = async (file) => {
    const formData = new FormData()
    formData.append("resume", file)
    const response = await api.post("/api/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const deleteProfileResume = async () => {
    const response = await api.delete("/api/profile/resume")
    return response.data
}

export const changePassword = async (payload) => {
    const response = await api.post("/api/profile/change-password", payload)
    return response.data
}

export const deleteAccount = async (password) => {
    const response = await api.delete("/api/profile", { data: { password } })
    return response.data
}
