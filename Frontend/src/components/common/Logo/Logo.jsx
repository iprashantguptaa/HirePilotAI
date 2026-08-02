// ============================================================================
// HirePilot AI - Premium Logo Component
// ============================================================================
// Memorable, AI-inspired wordmark with aviation theme

import './Logo.scss'

export const Logo = ({ variant = 'default', size = 'md', className = '' }) => {
  const classes = [
    'hp-logo',
    `hp-logo--${variant}`,
    `hp-logo--${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="hp-logo__icon">
        {/* Aviation-inspired AI icon */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer gradient ring */}
          <circle 
            cx="20" 
            cy="20" 
            r="18" 
            stroke="url(#logo-gradient)" 
            strokeWidth="2"
            fill="none"
          />
          
          {/* AI Pilot symbol - stylized path/trajectory */}
          <path
            d="M12 24 L20 12 L28 24 M20 12 L20 28"
            stroke="url(#logo-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* AI nodes/dots */}
          <circle cx="20" cy="12" r="2.5" fill="url(#logo-gradient)" />
          <circle cx="12" cy="24" r="2" fill="url(#logo-gradient)" opacity="0.7" />
          <circle cx="28" cy="24" r="2" fill="url(#logo-gradient)" opacity="0.7" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="hp-logo__wordmark">
        <span className="hp-logo__name">
          <span className="hp-logo__hire">Hire</span>
          <span className="hp-logo__pilot">Pilot</span>
        </span>
        <span className="hp-logo__ai">AI</span>
      </div>
    </div>
  )
}

// Icon-only variant for compact spaces
export const LogoIcon = ({ size = 'md', className = '' }) => {
  const classes = [
    'hp-logo-icon',
    `hp-logo-icon--${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle 
          cx="20" 
          cy="20" 
          r="18" 
          stroke="url(#icon-gradient)" 
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M12 24 L20 12 L28 24 M20 12 L20 28"
          stroke="url(#icon-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="12" r="2.5" fill="url(#icon-gradient)" />
        <circle cx="12" cy="24" r="2" fill="url(#icon-gradient)" opacity="0.7" />
        <circle cx="28" cy="24" r="2" fill="url(#icon-gradient)" opacity="0.7" />
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default Logo
