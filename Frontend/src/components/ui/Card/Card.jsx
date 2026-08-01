// ============================================================================
// HirePilot AI Design System - Card Component
// ============================================================================

import React from 'react'
import './Card.scss'

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const classes = [
    'hp-card',
    `hp-card--${variant}`,
    `hp-card--padding-${padding}`,
    hoverable && 'hp-card--hoverable',
    onClick && 'hp-card--clickable',
    className
  ].filter(Boolean).join(' ')

  const Component = onClick ? 'button' : 'div'

  return (
    <Component className={classes} onClick={onClick} {...props}>
      {children}
    </Component>
  )
}

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`hp-card__header ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`hp-card__title ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`hp-card__description ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`hp-card__content ${className}`} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`hp-card__footer ${className}`} {...props}>
    {children}
  </div>
)

export default Card
