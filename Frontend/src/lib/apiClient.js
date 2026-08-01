import axios from "axios"

// VITE_API_URL must be set at build time for any deployed environment
// (Vercel, etc) -- see Frontend/.env.example. Falls back to localhost
// for local development only.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const apiClient = axios.create({
    baseURL,
    withCredentials: true
})

// Access tokens are short-lived (15 min) by design (see Backend .env.example),
// with a longer-lived refresh token cookie meant to renew them silently.
// Without this interceptor, nothing ever calls /refresh-token and users
// would be logged out every 15 minutes regardless of the refresh token's
// existence.
let refreshPromise = null

function isAuthEndpoint(url = "") {
    return url.includes("/api/auth/login")
        || url.includes("/api/auth/register")
        || url.includes("/api/auth/refresh-token")
        || url.includes("/api/auth/logout")
}

apiClient.interceptors.response.use(
    (response) => response,
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
            // Multiple requests can 401 at once (e.g. a page firing several
            // calls right as the token expires) -- share one in-flight
            // refresh instead of firing several refresh-token calls.
            refreshPromise = refreshPromise || apiClient.post("/api/auth/refresh-token")
            await refreshPromise
            refreshPromise = null

            return apiClient(originalRequest)
        } catch (refreshError) {
            refreshPromise = null
            return Promise.reject(error)
        }
    }
)

export default apiClient
