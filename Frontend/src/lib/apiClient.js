import axios from "axios"
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./tokenStorage"

/**
 * Resolve API base URL.
 * On the Vercel frontend, always call same-origin `/api/...` so Vercel can
 * proxy to Render and auth cookies become first-party (fixes signup/login
 * on other devices / Safari). Locally, hit the Express server directly.
 */
function resolveBaseURL() {
    const configured = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "")

    if (typeof window !== "undefined") {
        const host = window.location.hostname
        if (host.endsWith(".vercel.app")) return ""
    }

    if (configured === "" || configured === "same" || configured === "/") return ""
    if (configured) return configured
    return "http://localhost:3000"
}

const apiClient = axios.create({
    baseURL: resolveBaseURL(),
    withCredentials: true,
    // Render free-tier cold starts can take 30–60s.
    timeout: 60000
})

let refreshPromise = null

function isAuthEndpoint(url = "") {
    return url.includes("/api/auth/login")
        || url.includes("/api/auth/verify-login-otp")
        || url.includes("/api/auth/register")
        || url.includes("/api/auth/forgot-password")
        || url.includes("/api/auth/reset-password")
        || url.includes("/api/auth/refresh-token")
        || url.includes("/api/auth/logout")
}

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => {
        const data = response?.data
        if (data?.accessToken || data?.refreshToken) {
            saveTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            })
        }
        return response
    },
    async (error) => {
        const originalRequest = error.config

        const isUnauthorized = error.response?.status === 401
        const alreadyRetried = originalRequest?._retry
        const skipRefresh = !originalRequest || isAuthEndpoint(originalRequest.url)

        if (!isUnauthorized || alreadyRetried || skipRefresh) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            refreshPromise = refreshPromise || apiClient.post("/api/auth/refresh-token", {
                refreshToken: getRefreshToken() || undefined
            })
            await refreshPromise
            refreshPromise = null

            return apiClient(originalRequest)
        } catch (refreshError) {
            refreshPromise = null
            clearTokens()
            return Promise.reject(error)
        }
    }
)

export default apiClient
