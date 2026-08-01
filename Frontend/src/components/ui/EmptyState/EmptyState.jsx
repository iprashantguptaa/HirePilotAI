// ============================================================================
// HirePilot AI Design System - EmptyState Component
// ============================================================================

import React from 'react'
import './EmptyState.scss'

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`hp-empty-state ${className}`} {...props}>
      {icon && (
        <div className="hp-empty-state__icon">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="hp-empty-state__title">{title}</h3>
      )}
      
      {description && (
        <p className="hp-empty-state__description">{description}</p>
      )}
      
      {action && (
        <div className="hp-empty-state__action">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
