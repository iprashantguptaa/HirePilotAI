import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { SEO } from '../../../components/common'
import { useBrand } from '../../../hooks/useBrand'
import AuthLayout from '../../../components/layout/AuthLayout'
import AuthFormCard from '../../../components/layout/AuthFormCard'
import { Input, PasswordInput, Button } from '../../../components/ui'

const Register = () => {
  const navigate = useNavigate()
  const brand = useBrand()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})

  const { loading, handleRegister } = useAuth()

  const validateForm = () => {
    const newErrors = {}
    
    if (!username) {
      newErrors.username = "Username is required"
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await handleRegister({ username, email, password })
    if (success) {
      navigate("/")
    }
  }

  const UserIcon = () => (
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )

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
        title={brand.pages.register.title}
        description={brand.pages.register.description}
      />
      
      <AuthLayout>
        <AuthFormCard
          title={`Create your ${brand.productName} account`}
          subtitle="Start preparing for your dream job today"
          footer={
            <>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              label="Username"
              placeholder="rahulsharma"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) setErrors({ ...errors, username: null })
              }}
              leftIcon={<UserIcon />}
              error={errors.username}
              helperText={!errors.username && "Minimum 3 characters"}
              required
              fullWidth
              autoComplete="username"
            />

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
              placeholder="Create a strong password"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Create account
            </Button>

            <p style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--color-text-tertiary)', 
              textAlign: 'center',
              marginTop: 'var(--space-2)'
            }}>
              By signing up, you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--color-primary-600)' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--color-primary-600)' }}>Privacy Policy</Link>
            </p>
          </form>
        </AuthFormCard>
      </AuthLayout>
    </>
  )
}

export default Register
