import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Input, Button, Alert } from '../../../components/ui'

const ForgotPassword = () => {
  const { handleForgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = () => {
    if (!email) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail()) {
      return
    }

    setSubmitting(true)
    setError("")
    const success = await handleForgotPassword({ email })
    setSubmitting(false)
    
    if (success) {
      setSent(true)
    }
  }

  const EmailIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )

  return (
    <AuthLayout>
      <AuthFormCard
        title="Reset your password"
        subtitle={sent ? "" : "Enter your email address and we'll send you a reset link"}
        footer={
          <Link to="/login">Back to sign in</Link>
        }
      >
        {sent ? (
          <Alert 
            variant="success" 
            title="Check your email"
            message="If an account exists for that email, we've sent a password reset link. Please check your inbox and spam folder."
            className="animate-scale-in"
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Email address"
              placeholder="rahul@example.com"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
            >
              Send reset link
            </Button>
          </form>
        )}
      </AuthFormCard>
    </AuthLayout>
  )
}

export default ForgotPassword
