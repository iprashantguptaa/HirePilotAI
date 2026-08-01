// ============================================================================
// HirePilot AI Design System - Input Component
// ============================================================================

import React, { forwardRef, useState } from 'react'
import './Input.scss'

export const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  size = 'md',
  fullWidth = false,
  showCharacterCount = false,
  maxLength,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)

  const wrapperClasses = [
    'hp-input-wrapper',
    `hp-input-wrapper--${size}`,
    focused && 'hp-input-wrapper--focused',
    error && 'hp-input-wrapper--error',
    disabled && 'hp-input-wrapper--disabled',
    fullWidth && 'hp-input-wrapper--full-width',
    className
  ].filter(Boolean).join(' ')

  const characterCount = value?.length || 0

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="hp-input__label">
          {label}
          {required && <span className="hp-input__required">*</span>}
        </label>
      )}
      
      <div className="hp-input__container">
        {leftIcon && (
          <span className="hp-input__icon hp-input__icon--left">
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          type={type}
          className="hp-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          {...props}
        />
        
        {rightIcon && (
          <span className="hp-input__icon hp-input__icon--right">
            {rightIcon}
          </span>
        )}
      </div>
      
      {(error || helperText || showCharacterCount) && (
        <div className="hp-input__footer">
          {error ? (
            <span className="hp-input__error">{error}</span>
          ) : helperText ? (
            <span className="hp-input__helper">{helperText}</span>
          ) : (
            <span></span>
          )}
          
          {showCharacterCount && maxLength && (
            <span className="hp-input__count">
              {characterCount} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
