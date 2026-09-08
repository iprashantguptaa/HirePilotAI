// ============================================================================
// HirePilot AI Design System - ErrorState Component
// ============================================================================

import React from 'react'
import './ErrorState.scss'

const DefaultIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const ErrorState = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`hp-error-state ${className}`} role="alert" {...props}>
      <div className="hp-error-state__icon">
        {icon || <DefaultIcon />}
      </div>

      {title && (
        <h3 className="hp-error-state__title">{title}</h3>
      )}

      {description && (
        <p className="hp-error-state__description">{description}</p>
      )}

      {action && (
        <div className="hp-error-state__action">
          {action}
        </div>
      )}
    </div>
  )
}

export default ErrorState
