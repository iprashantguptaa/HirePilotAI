// ============================================================================
// HirePilot AI - Skill Gap Chart Component
// ============================================================================
// Visual bar chart for skill gaps with severity indicators
// ============================================================================

import './SkillGapChart.scss'

const SkillGapChart = ({ skillGaps }) => {
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div className="skill-gap-chart skill-gap-chart--empty">
        <p>No skill gaps detected yet</p>
      </div>
    )
  }

  // Sort by severity and frequency
  const sortedGaps = [...skillGaps].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    if (severityOrder[a.maxSeverity] !== severityOrder[b.maxSeverity]) {
      return severityOrder[b.maxSeverity] - severityOrder[a.maxSeverity]
    }
    return b.count - a.count
  })

  // Take top 8 for better display
  const topGaps = sortedGaps.slice(0, 8)

  const getSeverityLabel = (severity) => {
    const labels = {
      high: 'Critical',
      medium: 'Important',
      low: 'Minor'
    }
    return labels[severity] || severity
  }

  const getSeverityWidth = (severity, count) => {
    const base = severity === 'high' ? 100 : severity === 'medium' ? 70 : 40
    const countFactor = Math.min(count * 10, 30)
    return Math.min(base + countFactor, 100)
  }

  return (
    <div className="skill-gap-chart">
      <div className="skill-gap-chart__list">
        {topGaps.map((gap, index) => {
          const width = getSeverityWidth(gap.maxSeverity, gap.count)
          
          return (
            <div 
              key={index} 
              className={`skill-gap-item skill-gap-item--${gap.maxSeverity}`}
              style={{ '--animation-delay': `${index * 0.05}s` }}
            >
              <div className="skill-gap-item__header">
                <span className="skill-gap-item__skill">{gap.skill}</span>
                <div className="skill-gap-item__meta">
                  <span className={`skill-gap-item__badge skill-gap-item__badge--${gap.maxSeverity}`}>
                    {getSeverityLabel(gap.maxSeverity)}
                  </span>
                  <span className="skill-gap-item__count">{gap.count}x</span>
                </div>
              </div>
              
              <div className="skill-gap-item__bar-container">
                <div 
                  className={`skill-gap-item__bar skill-gap-item__bar--${gap.maxSeverity}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {skillGaps.length > 8 && (
        <div className="skill-gap-chart__footer">
          <span className="skill-gap-chart__hint">
            Showing top 8 of {skillGaps.length} skill gaps
          </span>
        </div>
      )}
    </div>
  )
}

export default SkillGapChart
