import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification } from "../services/auth.api";
import { useToast } from "../../../components/ui/Toast/useToast";

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
}

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    const toast = useToast()

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't log in. Please check your email and password."))
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't create your account. Please try again."))
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't log out. Please try again."))
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async ({ email }) => {
        try {
            const data = await forgotPassword({ email })
            toast?.success(data.message)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't send the reset email. Please try again."))
            return false
        }
    }

    const handleResetPassword = async ({ token, password }) => {
        try {
            const data = await resetPassword({ token, password })
            toast?.success(data.message)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "That reset link is invalid or has expired."))
            return false
        }
    }

    const handleVerifyEmail = async ({ token }) => {
        try {
            const data = await verifyEmail({ token })
            toast?.success(data.message)
            setUser((current) => (current ? { ...current, isEmailVerified: true } : current))
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "That verification link is invalid or has expired."))
            return false
        }
    }

    const handleResendVerification = async () => {
        try {
            const data = await resendVerification()
            toast?.success(data.message)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't resend the verification email."))
            return false
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        user, loading,
        handleRegister, handleLogin, handleLogout,
        handleForgotPassword, handleResetPassword, handleVerifyEmail, handleResendVerification
    }
}
