import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { SEO } from '../../../components/common'
import { useBrand } from '../../../hooks/useBrand'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Input, PasswordInput, Button } from '../../../components/ui'

const Login = () => {
  const { loading, handleLogin } = useAuth()
  const brand = useBrand()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await handleLogin({ email, password })
    if (success) {
      navigate('/dashboard')
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

  if (loading) {
    return (
      <AuthLayout>
        <AuthFormCard>
          <div className="center" style={{ padding: 'var(--space-12) 0' }}>
            <div className="animate-spin">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          </div>
        </AuthFormCard>
      </AuthLayout>
    )
  }

  return (
    <>
      <SEO 
        title={brand.pages.login.title}
        description={brand.pages.login.description}
      />
      
      <AuthLayout>
        <AuthFormCard
          title={`Welcome back to ${brand.productName}`}
          subtitle={brand.tagline}
          footer={
            <>
              Don't have an account?{' '}
              <Link to="/register">Sign up</Link>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Email address"
              placeholder="rahul@example.com"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign in
            </Button>
          </form>
        </AuthFormCard>
      </AuthLayout>
    </>
  )
}

export default Login
