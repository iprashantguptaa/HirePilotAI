import { useEffect } from "react"
import { Link } from "react-router"
import { useInterview } from "../../interview/hooks/useInterview"
import { 
  EmptyState, 
  SkeletonCard, 
  EnhancedMetricCard,
  TrendChart,
  SkillGapChart,
  Button
} from "../../../components/ui"
import { computeSummary, computeTopSkillGaps, computeScoreTrend } from "../utils/dashboardStats"
import "./dashboard.scss"

const scoreClass = (score) => (score >= 80 ? "score--high" : score >= 60 ? "score--mid" : "score--low")

const Dashboard = () => {
  const { reports, loading, getReports } = useInterview()

  useEffect(() => {
    getReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = computeSummary(reports)
  const topSkillGaps = computeTopSkillGaps(reports)
  const trend = computeScoreTrend(reports)
  const recent = (reports || []).slice(0, 5)

  // Icons for metric cards
  const InterviewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  )

  const ScoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )

  const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  )

  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )

  return (
    <div className="dashboard-page container">
      {/* Header */}
      <header className="dashboard-page__header">
        <div>
          <h1>Your <span className="highlight">Dashboard</span></h1>
          <p>Track your interview preparation progress and identify areas for improvement</p>
        </div>
        <Link to="/interview/new">
          <Button variant="primary" size="lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 'var(--space-2)' }}>
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Interview
          </Button>
        </Link>
      </header>

      {loading && !reports.length ? (
        // Loading State
        <div className="dashboard-page__stats">
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
        </div>
      ) : summary.total === 0 ? (
        // Empty State
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          }
          title="No interviews yet"
          description="Generate your first AI-powered interview plan to see your stats, track your progress, and identify areas for improvement."
          action={
            <Link to="/interview/new">
              <Button variant="primary" size="lg">
                Create your first interview
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="dashboard-page__stats">
            <EnhancedMetricCard
              label="Total Interviews"
              value={summary.total}
              icon={<InterviewIcon />}
              color="primary"
              trend={summary.total > 5 ? { value: 12, isPositive: true } : null}
              animateValue
            />
            
            <EnhancedMetricCard
              label="Average Score"
              value={`${summary.averageScore}%`}
              icon={<ScoreIcon />}
              color={summary.averageScore >= 70 ? "success" : "default"}
              hint={summary.averageScore >= 70 ? "Great performance!" : "Keep practicing"}
              animateValue
            />
            
            <EnhancedMetricCard
              label="Best Score"
              value={`${summary.bestScore}%`}
              icon={<TrophyIcon />}
              color="success"
              animateValue
            />
            
            <EnhancedMetricCard
              label="Last Activity"
              value={summary.latestDate ? new Date(summary.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}
              icon={<CalendarIcon />}
              hint={summary.latestDate ? "Keep up the momentum" : null}
              animateValue={false}
            />
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-page__grid">
            {/* Score Trend */}
            <section className="dashboard-panel dashboard-panel--chart">
              <h2>Score Trend</h2>
              {trend.length >= 2 ? (
                <TrendChart data={trend} />
              ) : (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                  <p>Generate a couple more interviews to see your trend line.</p>
                </div>
              )}
            </section>

            {/* Skill Gaps */}
            <section className="dashboard-panel dashboard-panel--skills">
              <h2>Areas for Improvement</h2>
              <SkillGapChart skillGaps={topSkillGaps} />
            </section>
          </div>

          {/* Recent Interviews */}
          <section className="dashboard-panel">
            <div className="dashboard-panel__header">
              <h2>Recent Interviews</h2>
              <Link to="/history" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary-600)' }}>
                View all →
              </Link>
            </div>
            
            {recent.length === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 'var(--space-6)' }}>
                No interviews yet
              </p>
            ) : (
              <ul className="recent-list">
                {recent.map((report) => (
                  <li key={report._id}>
                    <Link to={`/interview/${report._id}`} className="recent-list__item">
                      <span className="recent-list__title">{report.title || "Untitled position"}</span>
                      <span className="recent-list__date">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`match-badge ${scoreClass(report.matchScore)}`}>
                        {report.matchScore}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Dashboard
