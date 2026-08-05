const ACCESS_KEY = "hp_access_token"
const REFRESH_KEY = "hp_refresh_token"

export function saveTokens({ accessToken, refreshToken } = {}) {
    try {
        if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken)
        if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken)
    } catch {
        // sessionStorage can throw in locked-down browsers — ignore.
    }
}

export function clearTokens() {
    try {
        sessionStorage.removeItem(ACCESS_KEY)
        sessionStorage.removeItem(REFRESH_KEY)
    } catch {
        // ignore
    }
}

export function getAccessToken() {
    try {
        return sessionStorage.getItem(ACCESS_KEY)
    } catch {
        return null
    }
}

export function getRefreshToken() {
    try {
        return sessionStorage.getItem(REFRESH_KEY)
    } catch {
        return null
    }
}
