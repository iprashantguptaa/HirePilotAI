import { Navigate, useLocation } from "react-router"
import { useAuth } from "../hooks/useAuth"

const GuestOnly = ({ children }) => {
    const { loading, user } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <main className="route-guard" aria-busy="true">
                <div className="route-guard__spinner" aria-hidden="true" />
                <p className="route-guard__text">Checking your session…</p>
            </main>
        )
    }

    if (user) {
        const from = location.state?.from
        const dest = typeof from === "string" && from.startsWith("/") ? from : "/dashboard"
        return <Navigate to={dest} replace />
    }

    return children
}

export default GuestOnly
