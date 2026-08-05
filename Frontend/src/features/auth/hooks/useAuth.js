import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
    login,
    verifyLoginOtp,
    register,
    logout,
    forgotPassword,
    resetPassword,
    resetPasswordWithOtp,
    verifyEmail,
    resendVerification
} from "../services/auth.api";
import { clearTokens } from "../../../lib/tokenStorage";
import { useToast } from "../../../components/ui/Toast/useToast";

function getErrorMessage(error, fallback) {
    if (error?.response?.data?.message) {
        return error.response.data.message
    }

    const isLocal = typeof window !== "undefined"
        && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)

    if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
        return isLocal
            ? "The server took too long to respond. Make sure the backend is running on port 3000, then try again."
            : "The server took too long to respond. The API may be waking up — wait about a minute and try again."
    }

    if (error?.message === "Network Error" || !error?.response) {
        return isLocal
            ? "Can't reach the server. Start the backend (port 3000) and open the app via http://localhost:5173 — not a wrong API URL."
            : "Can't reach the server. The API may be down, waking up, or blocking this site (CORS). Try again in a minute."
    }

    return fallback
}

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    const toast = useToast()

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            // New flow: password OK → OTP required. Old flow safety net if
            // a server still returns a user immediately.
            if (data.requiresOtp) {
                return {
                    requiresOtp: true,
                    email: data.email,
                    previewOtp: data.previewOtp,
                    message: data.message
                }
            }
            if (data.user) {
                setUser(data.user)
                return { requiresOtp: false }
            }
            toast?.error("Unexpected login response. Please try again.")
            return false
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't log in. Please check your email and password."))
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyLoginOtp = async ({ email, otp }) => {
        setLoading(true)
        try {
            const data = await verifyLoginOtp({ email, otp })
            setUser(data.user)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't verify that OTP. Please try again."))
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
            clearTokens()
            setUser(null)
            return true
        } catch (err) {
            clearTokens()
            setUser(null)
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
            return { ok: true, previewOtp: data.previewOtp }
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't send the reset OTP. Please try again."))
            return { ok: false }
        }
    }

    const handleResetPasswordWithOtp = async ({ email, otp, password }) => {
        try {
            const data = await resetPasswordWithOtp({ email, otp, password })
            toast?.success(data.message)
            return true
        } catch (err) {
            toast?.error(getErrorMessage(err, "Couldn't reset the password. Check the OTP and try again."))
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

    return {
        user, loading,
        handleRegister, handleLogin, handleVerifyLoginOtp, handleLogout,
        handleForgotPassword, handleResetPasswordWithOtp, handleResetPassword,
        handleVerifyEmail, handleResendVerification
    }
}
