import api from "../../../lib/apiClient"

export const getStats = async () => (await api.get("/api/admin/stats")).data

export const getUsers = async ({ page = 1, search = "" } = {}) =>
    (await api.get("/api/admin/users", { params: { page, search } })).data

export const updateUser = async (userId, payload) =>
    (await api.patch(`/api/admin/users/${userId}`, payload)).data

export const deleteUser = async (userId) =>
    (await api.delete(`/api/admin/users/${userId}`)).data

export const getInterviews = async ({ page = 1, search = "" } = {}) =>
    (await api.get("/api/admin/interviews", { params: { page, search } })).data

export const deleteInterview = async (interviewId) =>
    (await api.delete(`/api/admin/interviews/${interviewId}`)).data

export const getAiUsage = async () => (await api.get("/api/admin/ai-usage")).data

export const getFeatureFlags = async () => (await api.get("/api/admin/feature-flags")).data

export const upsertFeatureFlag = async (key, payload) =>
    (await api.patch(`/api/admin/feature-flags/${key}`, payload)).data

export const getFeedback = async ({ page = 1, status = "" } = {}) =>
    (await api.get("/api/admin/feedback", { params: { page, status } })).data

export const updateFeedback = async (feedbackId, status) =>
    (await api.patch(`/api/admin/feedback/${feedbackId}`, { status })).data

export const getAuditLog = async ({ page = 1 } = {}) =>
    (await api.get("/api/admin/audit-log", { params: { page } })).data
