// ============================================================================
// HirePilot AI Design System - Button Component
// ============================================================================

import React, { forwardRef } from 'react'
import './Button.scss'

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const classes = [
    'hp-button',
    `hp-button--${variant}`,
    `hp-button--${size}`,
    loading && 'hp-button--loading',
    disabled && 'hp-button--disabled',
    fullWidth && 'hp-button--full-width',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="hp-button__spinner">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      
      {!loading && leftIcon && (
        <span className="hp-button__icon hp-button__icon--left">
          {leftIcon}
        </span>
      )}
      
      <span className="hp-button__content">{children}</span>
      
      {!loading && rightIcon && (
        <span className="hp-button__icon hp-button__icon--right">
          {rightIcon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
