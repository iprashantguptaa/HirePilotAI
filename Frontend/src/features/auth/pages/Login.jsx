import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { SEO } from '../../../components/common'
import { useBrand } from '../../../hooks/useBrand'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Input, PasswordInput, Button, Alert } from '../../../components/ui'

const Login = () => {
  const { loading, handleLogin, handleVerifyLoginOtp } = useAuth()
  const brand = useBrand()
  const navigate = useNavigate()
  const location = useLocation()

  const [ email, setEmail ] = useState("")
  const [ password, setPassword ] = useState("")
  const [ otp, setOtp ] = useState("")
  const [ step, setStep ] = useState("credentials") // credentials | otp
  const [ previewOtp, setPreviewOtp ] = useState("")
  const [ infoMessage, setInfoMessage ] = useState(location.state?.message || "")
  const [ errors, setErrors ] = useState({})

  const validateCredentials = () => {
    const next = {}
    if (!email) next.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Email is invalid"
    if (!password) next.password = "Password is required"
    else if (password.length < 6) next.password = "Password must be at least 6 characters"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onCredentialsSubmit = async (e) => {
    e.preventDefault()
    if (!validateCredentials()) return

    const result = await handleLogin({ email, password })
    if (!result) return

    if (result.requiresOtp) {
      setStep("otp")
      setPreviewOtp(result.previewOtp || "")
      setInfoMessage(result.message || "Enter the 6-digit OTP sent to your email.")
      return
    }

    navigate(location.state?.from || "/dashboard")
  }

  const onOtpSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: "Enter the 6-digit OTP" })
      return
    }

    const ok = await handleVerifyLoginOtp({ email, otp: otp.trim() })
    if (ok) navigate(location.state?.from || "/dashboard")
  }

  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )

  return (
    <>
      <SEO
        title={brand.pages.login.title}
        description={brand.pages.login.description}
      />

      <AuthLayout>
        <AuthFormCard
          title={step === "otp" ? "Enter login OTP" : `Welcome back to ${brand.productName}`}
          subtitle={step === "otp"
            ? "Free email OTP — no paid SMS. Check your inbox, or the code shown below if email is not configured."
            : (brand.product?.tagline || "Sign in to continue")}
          footer={
            <>
              Don't have an account?{' '}
              <Link to="/register" state={location.state}>Sign up</Link>
            </>
          }
        >
          {infoMessage && (
            <Alert variant="info" title="Continue" message={infoMessage} className="animate-scale-in" />
          )}

          {step === "credentials" ? (
            <form onSubmit={onCredentialsSubmit}>
              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: null })
                }}
                leftIcon={<EmailIcon />}
                error={errors.email}
                required
                fullWidth
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: null })
                }}
                error={errors.password}
                required
                fullWidth
                autoComplete="current-password"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={onOtpSubmit}>
              {previewOtp && (
                <Alert
                  variant="warning"
                  title="Local / free OTP preview"
                  message={`SMTP is not configured, so your login code is: ${previewOtp}`}
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
                  if (errors.otp) setErrors({ ...errors, otp: null })
                }}
                error={errors.otp}
                required
                fullWidth
                autoComplete="one-time-code"
              />

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Verify and sign in
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => {
                  setStep("credentials")
                  setOtp("")
                  setPreviewOtp("")
                  setInfoMessage("")
                }}
              >
                Back to email and password
              </Button>
            </form>
          )}
        </AuthFormCard>
      </AuthLayout>
    </>
  )
}

export default Login
