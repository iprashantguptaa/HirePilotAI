import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { PasswordInput, Button } from '../../../components/ui'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { handleResetPassword } = useAuth()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    const success = await handleResetPassword({ token, password })
    setSubmitting(false)

    if (success) {
      navigate("/login")
    }
  }

  return (
    <AuthLayout>
      <AuthFormCard
        title="Create a new password"
        subtitle="Choose a strong password for your account"
        footer={
          <Link to="/login">Back to sign in</Link>
        }
      >
        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="New password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: null })
            }}
            error={errors.password}
            helperText={!errors.password && "Minimum 8 characters"}
            required
            fullWidth
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null })
            }}
            error={errors.confirmPassword}
            required
            fullWidth
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={submitting}
          >
            Reset password
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}

export default ResetPassword
