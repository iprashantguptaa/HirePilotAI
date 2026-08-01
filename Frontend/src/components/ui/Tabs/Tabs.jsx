// ============================================================================
// HirePilot AI Design System - Tabs Component
// ============================================================================

import React, { useState } from 'react'
import './Tabs.scss'

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div className={`hp-tabs ${className}`} {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, onValueChange: handleValueChange })
          : child
      )}
    </div>
  )
}

export const TabsList = ({ children, value, onValueChange, className = '', ...props }) => {
  return (
    <div className={`hp-tabs__list ${className}`} role="tablist" {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { 
              isActive: child.props.value === value,
              onClick: () => onValueChange?.(child.props.value)
            })
          : child
      )}
    </div>
  )
}

export const TabsTrigger = ({ 
  children, 
  value, 
  isActive, 
  onClick, 
  disabled = false,
  className = '', 
  ...props 
}) => {
  const classes = [
    'hp-tabs__trigger',
    isActive && 'hp-tabs__trigger--active',
    disabled && 'hp-tabs__trigger--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ children, value: currentValue, contentValue, className = '', ...props }) => {
  if (currentValue !== contentValue) return null

  return (
    <div 
      className={`hp-tabs__content ${className}`} 
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  )
}

export default Tabs
