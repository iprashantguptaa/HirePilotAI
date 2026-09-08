// ============================================================================
// HirePilot AI Design System - Textarea Component
// ============================================================================

import React, { forwardRef, useId, useState } from 'react'
import './Textarea.scss'

export const Textarea = forwardRef(({
  id,
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

  const generatedId = useId()
  const textareaId = id || `hp-textarea-${generatedId}`
  const errorId = `${textareaId}-error`
  const helperId = `${textareaId}-helper`
  // Point the textarea at whichever message is actually rendered below it.
  const describedBy = [
    error ? errorId : helperText ? helperId : null,
    props[ 'aria-describedby' ]
  ].filter(Boolean).join(' ') || undefined

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
        <label className="hp-textarea__label" htmlFor={textareaId}>
          {label}
          {required && <span className="hp-textarea__required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
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
        aria-invalid={error ? true : undefined}
        {...props}
        aria-describedby={describedBy}
      />
      
      {(error || helperText || showCharacterCount) && (
        <div className="hp-textarea__footer">
          {error ? (
            <span className="hp-textarea__error" id={errorId} role="alert">{error}</span>
          ) : helperText ? (
            <span className="hp-textarea__helper" id={helperId}>{helperText}</span>
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
