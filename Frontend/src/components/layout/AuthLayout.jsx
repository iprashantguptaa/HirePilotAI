// ============================================================================
// HirePilot AI - Auth Layout
// ============================================================================
// Split-screen layout for authentication pages
// Left: Form | Right: Brand panel with animated background
// ============================================================================

import { useBrand } from "../../hooks/useBrand"
import "./AuthLayout.scss"

const AuthLayout = ({ children }) => {
  const brand = useBrand()

  return (
    <div className="auth-layout">
      {/* Left Panel - Form Area */}
      <div className="auth-layout__form">
        <div className="auth-layout__form-content">
          {/* Logo/Brand */}
          <div className="auth-layout__logo">
            <span className="auth-layout__logo-text">{brand.productName}</span>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Panel - Brand Area */}
      <div className="auth-layout__brand">
        <div className="auth-layout__brand-content">
          <h2 className="auth-layout__brand-title">
            Master Your Interview,<br />
            <span className="text-gradient">Land Your Dream Job</span>
          </h2>
          
          <p className="auth-layout__brand-subtitle">
            Upload your resume, paste a job description, and practice with answers scored on five dimensions.
          </p>

          {/* Animated gradient mesh background */}
          <div className="auth-layout__mesh" aria-hidden="true" />
          
          {/* Product truths — not fabricated vanity metrics */}
          <div className="auth-layout__features">
            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature__value">5</div>
                <div className="auth-feature__label">Score dimensions</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature__value">₹0</div>
                <div className="auth-feature__label">To get started</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20v-6M6 20V10M18 20V4"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature__value">Live</div>
                <div className="auth-feature__label">Scored practice</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
