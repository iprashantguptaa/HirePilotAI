import { createContext, useEffect, useState } from "react"
import { getMe } from "./services/auth.api"
import { clearTokens } from "../../lib/tokenStorage"

export const AuthContext = createContext()

/**
 * Bootstraps the session once for the whole app. Previously every useAuth()
 * caller fired getMe on mount, which raced signup and cleared the user.
 */
export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function bootstrap() {
            try {
                const data = await getMe()
                if (!cancelled) setUser(data.user)
            } catch {
                if (!cancelled) {
                    clearTokens()
                    setUser(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        bootstrap()
        return () => { cancelled = true }
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
