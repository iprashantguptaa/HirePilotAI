import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Input, PasswordInput, Button, Alert } from '../../../components/ui'

const ForgotPassword = () => {
  const { handleForgotPassword, handleResetPasswordWithOtp } = useAuth()
  const navigate = useNavigate()

  const [ email, setEmail ] = useState("")
  const [ otp, setOtp ] = useState("")
  const [ password, setPassword ] = useState("")
  const [ step, setStep ] = useState("request") // request | reset
  const [ previewOtp, setPreviewOtp ] = useState("")
  const [ submitting, setSubmitting ] = useState(false)
  const [ error, setError ] = useState("")

  const requestOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("Email is required")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setSubmitting(true)
    setError("")
    const result = await handleForgotPassword({ email })
    setSubmitting(false)

    if (result?.ok) {
      setPreviewOtp(result.previewOtp || "")
      setStep("reset")
    }
  }

  const resetWithOtp = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP")
      return
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setSubmitting(true)
    setError("")
    const ok = await handleResetPasswordWithOtp({ email, otp: otp.trim(), password })
    setSubmitting(false)
    if (ok) navigate("/login")
  }

  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )

  return (
    <AuthLayout>
      <AuthFormCard
        title="Reset your password"
        subtitle={step === "request"
          ? "We'll send a free 6-digit OTP to your email. No paid SMS."
          : "Enter the OTP and choose a new password."}
        footer={<Link to="/login">Back to sign in</Link>}
      >
        {step === "request" ? (
          <form onSubmit={requestOtp}>
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("")
              }}
              leftIcon={<EmailIcon />}
              error={error}
              required
              fullWidth
              autoComplete="email"
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              Send free OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={resetWithOtp}>
            {previewOtp && (
              <Alert
                variant="warning"
                title="Local / free OTP preview"
                message={`SMTP is not configured, so your reset code is: ${previewOtp}`}
                className="animate-scale-in"
              />
            )}

            {!previewOtp && (
              <Alert
                variant="success"
                title="OTP sent"
                message="If that email has an account, a 6-digit code was sent. Check inbox and spam."
                className="animate-scale-in"
              />
            )}

            <Input
              type="text"
              inputMode="numeric"
              label="6-digit OTP"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                if (error) setError("")
              }}
              error={error && error.includes("OTP") ? error : undefined}
              required
              fullWidth
              autoComplete="one-time-code"
            />

            <PasswordInput
              label="New password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError("")
              }}
              error={error && error.includes("Password") ? error : undefined}
              required
              fullWidth
              autoComplete="new-password"
            />

            {error && !error.includes("OTP") && !error.includes("Password") && (
              <Alert variant="error" title="Couldn't reset" message={error} />
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
              Reset password
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setStep("request")
                setOtp("")
                setPassword("")
                setPreviewOtp("")
                setError("")
              }}
            >
              Use a different email
            </Button>
          </form>
        )}
      </AuthFormCard>
    </AuthLayout>
  )
}

export default ForgotPassword
