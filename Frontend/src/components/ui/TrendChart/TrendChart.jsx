// ============================================================================
// HirePilot AI - Trend Chart Component (Fallback)
// ============================================================================
// Simple SVG-based line chart without external dependencies
// ============================================================================

import { useMemo } from 'react'
import './TrendChart.scss'

const TrendChart = ({ data, title, height = 280 }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1

    const padding = 40
    const chartWidth = 800
    const chartHeight = height - 80
    const pointSpacing = (chartWidth - padding * 2) / (data.length - 1 || 1)

    const points = data.map((value, index) => {
      const x = padding + index * pointSpacing
      const y = chartHeight - ((value - minValue) / range) * (chartHeight - padding * 2) + padding
      return { x, y, value, index }
    })

    const pathD = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    return { points, pathD, maxValue, minValue, chartWidth, chartHeight }
  }, [data, height])

  if (!data || data.length === 0) {
    return (
      <div className="trend-chart trend-chart--empty">
        <p>No data available yet</p>
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="trend-chart trend-chart--single">
        <div className="trend-chart__single-value">
          <div className="trend-chart__single-label">Your Score</div>
          <div className="trend-chart__single-number">{data[0]}%</div>
          <div className="trend-chart__single-hint">Complete more interviews to see trends</div>
        </div>
      </div>
    )
  }

  const { points, pathD, maxValue, minValue, chartWidth, chartHeight } = chartData

  return (
    <div className="trend-chart">
      {title && <h3 className="trend-chart__title">{title}</h3>}
      
      <svg 
        className="trend-chart__svg"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <g className="trend-chart__grid">
          {[0, 25, 50, 75, 100].map((value) => {
            const y = chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * (chartHeight - 80) + 40
            return (
              <g key={value}>
                <line
                  x1={40}
                  y1={y}
                  x2={chartWidth - 40}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
                <text
                  x={20}
                  y={y + 5}
                  fill="var(--color-text-tertiary)"
                  fontSize="12"
                >
                  {value}
                </text>
              </g>
            )
          })}
        </g>

        {/* Area under line (gradient fill) */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-600)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - 40} L ${points[0].x} ${chartHeight - 40} Z`}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-primary-600)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="trend-chart__line"
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="var(--color-primary-600)"
              stroke="var(--color-surface)"
              strokeWidth="2"
              className="trend-chart__point"
            />
            <text
              x={point.x}
              y={chartHeight - 15}
              fill="var(--color-text-tertiary)"
              fontSize="12"
              textAnchor="middle"
            >
              #{index + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default TrendChart
