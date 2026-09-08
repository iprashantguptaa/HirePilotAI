import { createContext, useEffect, useState } from "react"
import { getMe } from "./services/auth.api"
import { clearTokens } from "../../lib/tokenStorage"

export const AuthContext = createContext()

/**
 * Bootstraps the session once for the whole app.
 * `bootstrapping` = initial getMe (must NOT drive login/register button spinners).
 * `submitting` = explicit auth actions (login/register/logout).
 */
export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ bootstrapping, setBootstrapping ] = useState(true)
    const [ submitting, setSubmitting ] = useState(false)

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
                if (!cancelled) setBootstrapping(false)
            }
        }

        bootstrap()
        return () => { cancelled = true }
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            bootstrapping,
            submitting,
            setSubmitting,
            // Back-compat: Protected means "session resolving"
            loading: bootstrapping,
            setLoading: setSubmitting
        }}>
            {children}
        </AuthContext.Provider>
    )
}
