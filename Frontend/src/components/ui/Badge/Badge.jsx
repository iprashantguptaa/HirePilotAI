// ============================================================================
// HirePilot AI Design System - Badge Component
// ============================================================================

import React from 'react'
import './Badge.scss'

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const classes = [
    'hp-badge',
    `hp-badge--${variant}`,
    `hp-badge--${size}`,
    dot && 'hp-badge--dot',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {dot && <span className="hp-badge__dot" />}
      {children}
    </span>
  )
}

export default Badge
