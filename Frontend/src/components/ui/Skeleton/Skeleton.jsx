// ============================================================================
// HirePilot AI Design System - Skeleton Component
// ============================================================================

import React from 'react'
import './Skeleton.scss'

export const Skeleton = ({
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  className = '',
  ...props
}) => {
  const style = {
    width,
    height,
    borderRadius
  }

  const classes = [
    'hp-skeleton',
    `hp-skeleton--${variant}`,
    className
  ].filter(Boolean).join(' ')

  return <div className={classes} style={style} {...props} />
}

export const SkeletonCard = ({ height = '200px', className = '' }) => (
  <div className={`hp-skeleton-card ${className}`} style={{ height }}>
    <Skeleton width="60%" height="1.5rem" />
    <Skeleton width="100%" height="1rem" />
    <Skeleton width="90%" height="1rem" />
    <Skeleton width="70%" height="1rem" />
  </div>
)

export default Skeleton
