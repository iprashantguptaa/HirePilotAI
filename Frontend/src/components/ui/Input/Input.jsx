// ============================================================================
// HirePilot AI Design System - Input Component
// ============================================================================

import React, { forwardRef, useId, useState } from 'react'
import './Input.scss'

export const Input = forwardRef(({
  type = 'text',
  id,
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

  const generatedId = useId()
  const inputId = id || `hp-input-${generatedId}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  // Point the input at whichever message is actually rendered below it.
  const describedBy = [
    error ? errorId : helperText ? helperId : null,
    props[ 'aria-describedby' ]
  ].filter(Boolean).join(' ') || undefined

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
        <label className="hp-input__label" htmlFor={inputId}>
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
          id={inputId}
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
          aria-invalid={error ? true : undefined}
          {...props}
          aria-describedby={describedBy}
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
            <span className="hp-input__error" id={errorId} role="alert">{error}</span>
          ) : helperText ? (
            <span className="hp-input__helper" id={helperId}>{helperText}</span>
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
