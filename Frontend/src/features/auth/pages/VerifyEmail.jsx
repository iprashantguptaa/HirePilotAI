import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Button, Alert } from '../../../components/ui'

const VerifyEmail = () => {
  const { token } = useParams()
  const { handleVerifyEmail } = useAuth()
  const [status, setStatus] = useState("verifying") // verifying | success | error

  useEffect(() => {
    let cancelled = false

    async function run() {
      const success = await handleVerifyEmail({ token })
      if (!cancelled) setStatus(success ? "success" : "error")
    }

    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const LoadingIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )

  return (
    <AuthLayout>
      <AuthFormCard
        title="Email Verification"
        footer={
          <Link to="/">Go to dashboard</Link>
        }
      >
        {status === "verifying" && (
          <div className="center" style={{ flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-8) 0' }}>
            <LoadingIcon />
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-scale-in">
            <Alert 
              variant="success" 
              title="Email verified!"
              message="Your email has been successfully verified. You're all set to start using HirePilot AI."
            />
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Link to="/">
                <Button variant="primary" size="lg" fullWidth>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="animate-scale-in">
            <Alert 
              variant="error" 
              title="Verification failed"
              message="This verification link is invalid or has expired. You can request a new verification email from your profile page."
            />
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link to="/profile">
                <Button variant="primary" size="lg" fullWidth>
                  Go to Profile
                </Button>
              </Link>
              <Link to="/">
                <Button variant="secondary" size="lg" fullWidth>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </AuthFormCard>
    </AuthLayout>
  )
}

export default VerifyEmail
