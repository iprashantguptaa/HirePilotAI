import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { useInterview } from "../../interview/hooks/useInterview"
import {
  ErrorState,
  SkeletonCard,
  EnhancedMetricCard,
  TrendChart,
  SkillGapChart,
  Button
} from "../../../components/ui"
import { computeSummary, computeTopSkillGaps, computeScoreTrend } from "../utils/dashboardStats"
import { getSessions } from "../../practice/services/practice.api"
import { SEO } from "../../../components/common"
import "./dashboard.scss"

const scoreClass = (score) => (score >= 80 ? "score--high" : score >= 60 ? "score--mid" : "score--low")

function daysBetween(a, b) {
  const ms = Math.abs(new Date(a).setHours(0, 0, 0, 0) - new Date(b).setHours(0, 0, 0, 0))
  return Math.round(ms / 86400000)
}

function computePrepStreak(timestamps) {
  const days = [ ...new Set(
    timestamps
      .filter(Boolean)
      .map((t) => new Date(t).toISOString().slice(0, 10))
  ) ].sort().reverse()

  if (!days.length) return 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (days[ 0 ] !== today && days[ 0 ] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[ i - 1 ], days[ i ]) === 1) streak += 1
    else break
  }
  return streak
}

const Dashboard = () => {
  const { reports, loading, getReports } = useInterview()
  const [ sessions, setSessions ] = useState([])
  const [ loadingSessions, setLoadingSessions ] = useState(true)
  const [ loadError, setLoadError ] = useState(null)

  const loadReports = async () => {
    setLoadError(null)
    const list = await getReports()
    if (!list) setLoadError("Couldn't load your dashboard.")
  }

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await getSessions()
        if (!cancelled) setSessions(response.sessions || [])
      } catch {
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) setLoadingSessions(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const summary = computeSummary(reports)
  const topSkillGaps = computeTopSkillGaps(reports)
  const trend = computeScoreTrend(reports)
  const recent = (reports || []).slice(0, 5)

  const latestPlan = reports?.[ 0 ] || null
  const latestSession = sessions[ 0 ] || null

  const lastActive = useMemo(() => {
    const stamps = [
      ...(reports || []).map((r) => r.updatedAt || r.createdAt),
      ...sessions.map((s) => s.completedAt || s.updatedAt || s.createdAt)
    ].filter(Boolean)
    if (!stamps.length) return null
    return stamps.sort((a, b) => new Date(b) - new Date(a))[ 0 ]
  }, [ reports, sessions ])

  const prepStreak = useMemo(() => {
    const stamps = [
      ...(reports || []).map((r) => r.createdAt),
      ...sessions.map((s) => s.completedAt || s.createdAt)
    ]
    return computePrepStreak(stamps)
  }, [ reports, sessions ])

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
      <SEO title="Dashboard" description="Pick up your interview plan, practice, and close skill gaps." noIndex />
      <header className="dashboard-page__header">
        <div>
          <h1>Your <span className="highlight">Dashboard</span></h1>
          <p>Pick up where you left off — plan, practice, close gaps.</p>
        </div>
        <Button as={Link} to="/interview/new" variant="primary" size="lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 'var(--space-2)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Interview
        </Button>
      </header>

      {loading && !(reports?.length) && loadingSessions ? (
        <div className="dashboard-page__stats">
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
          <SkeletonCard height="8rem" />
        </div>
      ) : loadError ? (
        <ErrorState
          title="Couldn't load your dashboard"
          description="Something went wrong on our end. Check your connection and try again."
          action={
            <Button variant="primary" size="lg" onClick={loadReports}>Try again</Button>
          }
        />
      ) : summary.total === 0 ? (
        <section className="dashboard-first-run" aria-labelledby="first-run-title">
          <h2 id="first-run-title">Start in three steps</h2>
          <p>Upload a resume, generate a plan, then practice scored answers.</p>
          <ol className="dashboard-first-run__steps">
            <li>
              <span className="dashboard-first-run__n">1</span>
              <div>
                <h3>Upload</h3>
                <p>Resume + job description for the role you want.</p>
              </div>
            </li>
            <li>
              <span className="dashboard-first-run__n">2</span>
              <div>
                <h3>Plan</h3>
                <p>Get match score, skill gaps, and priority actions.</p>
              </div>
            </li>
            <li>
              <span className="dashboard-first-run__n">3</span>
              <div>
                <h3>Practice</h3>
                <p>Answer scored questions and return to your plan.</p>
              </div>
            </li>
          </ol>
          <Button as={Link} to="/interview/new" variant="primary" size="lg">Create your first interview plan</Button>
        </section>
      ) : (
        <>
          <section className="dashboard-next" aria-labelledby="next-action-title">
            <p className="dashboard-continue__eyebrow">Next best action</p>
            <h2 id="next-action-title">
              {latestSession?.status === "in_progress"
                ? "Resume your practice session"
                : topSkillGaps[0]?.skill
                  ? `Practice a mock focused on ${topSkillGaps[0].skill}`
                  : latestPlan
                    ? "Run a scored practice set for your latest plan"
                    : "Create a plan to see your next action"}
            </h2>
            <p>
              {summary.averageScore != null
                ? `Career readiness from your plans: ${summary.averageScore}% average match.`
                : "Complete a plan to see readiness."}
            </p>
            {latestSession?.status === "in_progress" ? (
              <Button as={Link} to={`/practice/${latestSession._id}`} variant="primary">Continue practice</Button>
            ) : latestPlan ? (
              <Button as={Link} to={`/practice?report=${latestPlan._id}&focus=mixed&note=${encodeURIComponent(topSkillGaps[0]?.skill || latestPlan.title || "")}`} variant="primary">Practice this</Button>
            ) : null}
          </section>

          {(latestPlan || latestSession) && (
            <section className="dashboard-continue" aria-labelledby="continue-title">
              <div className="dashboard-continue__copy">
                <p className="dashboard-continue__eyebrow">Continue</p>
                <h2 id="continue-title">{latestPlan?.title || latestSession?.title || "Your prep"}</h2>
                <p>
                  {latestPlan && (
                    <>Latest plan · {latestPlan.matchScore}% match</>
                  )}
                  {latestPlan && latestSession && " · "}
                  {latestSession && (
                    <>
                      Last practice
                      {latestSession.status === "completed"
                        ? ` · scored ${Math.round(latestSession.report?.overallScore ?? 0)}`
                        : " · in progress"}
                    </>
                  )}
                  {lastActive && (
                    <> · Active {new Date(lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                  )}
                  {prepStreak > 0 && <> · {prepStreak}-day prep streak</>}
                </p>
              </div>
              <div className="dashboard-continue__actions">
                {latestSession?.status === "in_progress" ? (
                  <Button as={Link} to={`/practice/${latestSession._id}`} variant="primary" size="lg">Resume practice</Button>
                ) : latestPlan ? (
                  <Button as={Link} to={`/practice?report=${latestPlan._id}`} variant="primary" size="lg">Practice this plan</Button>
                ) : (
                  <Button as={Link} to="/practice" variant="primary" size="lg">Start practice</Button>
                )}
                {latestPlan && (
                  <Button as={Link} to={`/interview/${latestPlan._id}`} variant="secondary" size="lg">Open Results Hub</Button>
                )}
              </div>
            </section>
          )}

          <div className="dashboard-page__stats">
            <EnhancedMetricCard
              label="Total Interviews"
              value={summary.total}
              icon={<InterviewIcon />}
              color="primary"
              trend={null}
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
              value={lastActive ? new Date(lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}
              icon={<CalendarIcon />}
              hint={prepStreak > 0 ? `${prepStreak}-day prep streak` : "Come back tomorrow"}
              animateValue={false}
            />
          </div>

          <div className="dashboard-page__grid">
            <section className="dashboard-panel dashboard-panel--chart">
              <h2>Score Trend</h2>
              {trend?.length >= 2 ? (
                <TrendChart data={trend} />
              ) : (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                  <p>Generate a couple more interviews to see your trend line.</p>
                </div>
              )}
            </section>

            <section className="dashboard-panel dashboard-panel--skills">
              <h2>Areas for Improvement</h2>
              <SkillGapChart skillGaps={topSkillGaps} />
            </section>
          </div>

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
