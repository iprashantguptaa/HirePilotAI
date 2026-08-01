// ============================================================================
// HirePilot AI Design System - Alert Component
// ============================================================================

import React from 'react'
import './Alert.scss'

export const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className = '',
  ...props
}) => {
  const classes = [
    'hp-alert',
    `hp-alert--${variant}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} role="alert" {...props}>
      {icon && (
        <div className="hp-alert__icon">
          {icon}
        </div>
      )}
      
      <div className="hp-alert__content">
        {title && (
          <div className="hp-alert__title">{title}</div>
        )}
        <div className="hp-alert__message">{children}</div>
      </div>
      
      {onClose && (
        <button
          type="button"
          className="hp-alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M18 6L6 18M6 6l12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Alert
