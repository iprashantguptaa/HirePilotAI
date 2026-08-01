// ============================================================================
// HirePilot AI - Auth Form Card
// ============================================================================
// Reusable glassmorphism card wrapper for authentication forms
// ============================================================================

import "./AuthFormCard.scss"

const AuthFormCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-form-card animate-scale-in">
      <div className="auth-form-card__header">
        {title && <h1 className="auth-form-card__title">{title}</h1>}
        {subtitle && <p className="auth-form-card__subtitle">{subtitle}</p>}
      </div>

      <div className="auth-form-card__body">
        {children}
      </div>

      {footer && (
        <div className="auth-form-card__footer">
          {footer}
        </div>
      )}
    </div>
  )
}

export default AuthFormCard
