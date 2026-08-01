import { Navigate } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"

const AdminProtected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <main><h1>Loading...</h1></main>
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (user.role !== "admin") {
        return <Navigate to="/" />
    }

    return children
}

export default AdminProtected
