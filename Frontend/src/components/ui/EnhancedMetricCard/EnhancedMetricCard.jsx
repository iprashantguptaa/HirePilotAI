// ============================================================================
// HirePilot AI - Enhanced Metric Card
// ============================================================================
// Premium metric card with trend indicators and animations
// ============================================================================

import { useEffect, useState } from 'react'
import './EnhancedMetricCard.scss'

const EnhancedMetricCard = ({ 
  label, 
  value, 
  trend = null, // { value: 12, isPositive: true }
  icon = null,
  hint = null,
  color = 'default', // default | primary | success | warning | error
  animateValue = true
}) => {
  const [displayValue, setDisplayValue] = useState(animateValue ? '0' : value)

  useEffect(() => {
    if (!animateValue) return

    // Animate counter for numeric values
    const numericValue = typeof value === 'string' ? 
      parseInt(value.replace(/[^0-9]/g, '')) : value

    if (isNaN(numericValue)) {
      setDisplayValue(value)
      return
    }

    const duration = 1000 // 1 second
    const steps = 30
    const stepValue = numericValue / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        const currentValue = Math.floor(stepValue * currentStep)
        const suffix = typeof value === 'string' ? value.replace(/[0-9]/g, '') : ''
        setDisplayValue(currentValue + suffix)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value, animateValue])

  const TrendIcon = () => {
    if (!trend) return null
    
    if (trend.isPositive) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      )
    }
    
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    )
  }

  return (
    <div className={`enhanced-metric-card enhanced-metric-card--${color} hover-lift`}>
      {icon && (
        <div className="enhanced-metric-card__icon">
          {icon}
        </div>
      )}
      
      <div className="enhanced-metric-card__content">
        <div className="enhanced-metric-card__label">{label}</div>
        
        <div className="enhanced-metric-card__value">{displayValue}</div>
        
        {(trend || hint) && (
          <div className="enhanced-metric-card__footer">
            {trend && (
              <div className={`enhanced-metric-card__trend enhanced-metric-card__trend--${trend.isPositive ? 'positive' : 'negative'}`}>
                <TrendIcon />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            
            {hint && (
              <div className="enhanced-metric-card__hint">{hint}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedMetricCard
