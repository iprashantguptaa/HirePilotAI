import api from "../../../lib/apiClient"
import { getRefreshToken } from "../../../lib/tokenStorage"

export async function register({ username, email, password }) {
    const response = await api.post("/api/auth/register", { username, email, password })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function verifyLoginOtp({ email, otp }) {
    const response = await api.post("/api/auth/verify-login-otp", { email, otp })
    return response.data
}

export async function logout() {
    const response = await api.post("/api/auth/logout", {
        refreshToken: getRefreshToken() || undefined
    })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function forgotPassword({ email }) {
    const response = await api.post("/api/auth/forgot-password", { email })
    return response.data
}

export async function resetPasswordWithOtp({ email, otp, password }) {
    const response = await api.post("/api/auth/reset-password-otp", { email, otp, password })
    return response.data
}

export async function resetPassword({ token, password }) {
    const response = await api.post(`/api/auth/reset-password/${token}`, { password })
    return response.data
}

export async function verifyEmail({ token }) {
    const response = await api.get(`/api/auth/verify-email/${token}`)
    return response.data
}

export async function resendVerification() {
    const response = await api.post("/api/auth/resend-verification")
    return response.data
}
