// ============================================================================
// HirePilot AI Design System - Modal Component
// ============================================================================

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.scss'

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className="hp-modal-overlay" onClick={handleOverlayClick}>
      <div 
        className={`hp-modal hp-modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        {...props}
      >
        {(title || showCloseButton) && (
          <div className="hp-modal__header">
            {title && (
              <h2 id="modal-title" className="hp-modal__title">{title}</h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="hp-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg 
                  width="24" 
                  height="24" 
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
        )}
        
        <div className="hp-modal__content">
          {children}
        </div>
        
        {footer && (
          <div className="hp-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
