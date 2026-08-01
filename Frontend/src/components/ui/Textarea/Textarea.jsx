// ============================================================================
// HirePilot AI Design System - Textarea Component
// ============================================================================

import React, { forwardRef, useState } from 'react'
import './Textarea.scss'

export const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  fullWidth = false,
  showCharacterCount = false,
  maxLength,
  resize = 'vertical',
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)

  const wrapperClasses = [
    'hp-textarea-wrapper',
    focused && 'hp-textarea-wrapper--focused',
    error && 'hp-textarea-wrapper--error',
    disabled && 'hp-textarea-wrapper--disabled',
    fullWidth && 'hp-textarea-wrapper--full-width',
    className
  ].filter(Boolean).join(' ')

  const textareaClasses = [
    'hp-textarea',
    `hp-textarea--resize-${resize}`
  ].filter(Boolean).join(' ')

  const characterCount = value?.length || 0

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="hp-textarea__label">
          {label}
          {required && <span className="hp-textarea__required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        {...props}
      />
      
      {(error || helperText || showCharacterCount) && (
        <div className="hp-textarea__footer">
          {error ? (
            <span className="hp-textarea__error">{error}</span>
          ) : helperText ? (
            <span className="hp-textarea__helper">{helperText}</span>
          ) : (
            <span></span>
          )}
          
          {showCharacterCount && maxLength && (
            <span className="hp-textarea__count">
              {characterCount} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
