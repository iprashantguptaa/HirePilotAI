import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Button, Textarea, Badge, SkeletonCard, EmptyState } from "../../../components/ui"
import { useToast } from "../../../components/ui/Toast/useToast"
import { useInterview } from "../../interview/hooks/useInterview"
import { SEO } from "../../../components/common"
import { startSession, getSessions } from "../services/practice.api"
import { PRACTICE_MODES, QUESTION_COUNTS, scoreTone } from "../practice.utils"
import "../style/practice.scss"

const PracticeSetup = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const [ searchParams ] = useSearchParams()
    const { reports, loading: loadingReports, getReports } = useInterview()

    // Deep-linked from an interview report's "Practice this interview" action.
    const preselectedReportId = searchParams.get("report")

    const [ source, setSource ] = useState(preselectedReportId ? "report" : "jobDescription")
    const [ reportId, setReportId ] = useState(preselectedReportId || "")
    const [ jobDescription, setJobDescription ] = useState("")
    const [ mode, setMode ] = useState("mixed")
    const [ plannedQuestions, setPlannedQuestions ] = useState(6)
    const [ starting, setStarting ] = useState(false)

    const [ pastSessions, setPastSessions ] = useState([])
    const [ loadingSessions, setLoadingSessions ] = useState(true)

    useEffect(() => {
        getReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const response = await getSessions()
                if (!cancelled) setPastSessions(response.sessions || [])
            } catch {
                // A failed history fetch shouldn't block starting a new session.
                if (!cancelled) setPastSessions([])
            } finally {
                if (!cancelled) setLoadingSessions(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [])

    // `reportId` holds only an explicit user choice. The newest plan is used as
    // the default by deriving it here rather than writing it into state from an
    // effect, which would cause a cascading render.
    const effectiveReportId = reportId || reports?.[ 0 ]?._id || ""

    const canStart = source === "report" ? Boolean(effectiveReportId) : jobDescription.trim().length > 30

    const handleStart = async () => {
        if (!canStart || starting) return

        setStarting(true)
        try {
            const payload = source === "report"
                ? { interviewReportId: effectiveReportId, mode, plannedQuestions }
                : { jobDescription: jobDescription.trim(), mode, plannedQuestions }

            const response = await startSession(payload)
            navigate(`/practice/${response.session._id}`)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't start the practice session. Please try again.")
            setStarting(false)
        }
    }

    return (
        <>
            <SEO
                title="Mock Interview Practice | HirePilot AI"
                description="Practice a real interview one question at a time and get every answer scored against a rubric."
            />

            <div className="practice-setup container">
                <header className="practice-setup__header">
                    <Badge variant="default">Live practice</Badge>
                    <h1>Practice a real interview</h1>
                    <p>
                        One question at a time. You answer, we score it against a rubric and tell you
                        exactly what was missing, then the next question adapts to how you did.
                    </p>
                </header>

                <section className="practice-setup__card">
                    <h2>What are you interviewing for?</h2>

                    <div className="practice-setup__source" role="tablist" aria-label="Interview context source">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={source === "report"}
                            className={`source-tab ${source === "report" ? "source-tab--active" : ""}`}
                            onClick={() => setSource("report")}
                        >
                            Use an existing plan
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={source === "jobDescription"}
                            className={`source-tab ${source === "jobDescription" ? "source-tab--active" : ""}`}
                            onClick={() => setSource("jobDescription")}
                        >
                            Paste a job description
                        </button>
                    </div>

                    {source === "report" ? (
                        loadingReports && !reports?.length ? (
                            <SkeletonCard height="3rem" />
                        ) : reports?.length ? (
                            <label className="practice-setup__field">
                                <span>Interview plan</span>
                                <select value={effectiveReportId} onChange={(event) => setReportId(event.target.value)}>
                                    {reports.map((report) => (
                                        <option key={report._id} value={report._id}>
                                            {report.title || "Untitled position"} &mdash; {report.matchScore}% match
                                        </option>
                                    ))}
                                </select>
                                <small>Your resume and the job description from this plan are used as context.</small>
                            </label>
                        ) : (
                            <div className="practice-setup__inline-empty">
                                <p>You don't have any interview plans yet.</p>
                                <Link to="/interview/new">
                                    <Button variant="secondary">Create an interview plan</Button>
                                </Link>
                            </div>
                        )
                    ) : (
                        <Textarea
                            label="Job description"
                            placeholder="Paste the job description you're interviewing for..."
                            value={jobDescription}
                            onChange={(event) => setJobDescription(event.target.value)}
                            rows={7}
                            fullWidth
                            required
                            helperText="We'll use the resume saved on your profile as background, if you have one."
                        />
                    )}
                </section>

                <section className="practice-setup__card">
                    <h2>Interview style</h2>
                    <div className="practice-setup__modes">
                        {PRACTICE_MODES.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`mode-option ${mode === option.value ? "mode-option--active" : ""}`}
                                onClick={() => setMode(option.value)}
                                aria-pressed={mode === option.value}
                            >
                                <span className="mode-option__label">{option.label}</span>
                                <span className="mode-option__description">{option.description}</span>
                            </button>
                        ))}
                    </div>

                    <label className="practice-setup__field">
                        <span>How many questions?</span>
                        <div className="practice-setup__counts">
                            {QUESTION_COUNTS.map((count) => (
                                <button
                                    key={count}
                                    type="button"
                                    className={`count-option ${plannedQuestions === count ? "count-option--active" : ""}`}
                                    onClick={() => setPlannedQuestions(count)}
                                    aria-pressed={plannedQuestions === count}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                        <small>You can end the session early and still get a report.</small>
                    </label>
                </section>

                <div className="practice-setup__start">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleStart}
                        disabled={!canStart}
                        loading={starting}
                    >
                        {starting ? "Preparing your first question" : "Start interview"}
                    </Button>
                    {!canStart && source === "jobDescription" && (
                        <small>Paste a job description to continue.</small>
                    )}
                </div>

                <section className="practice-setup__history">
                    <h2>Your past sessions</h2>

                    {loadingSessions ? (
                        <SkeletonCard height="4rem" />
                    ) : pastSessions.length === 0 ? (
                        <EmptyState
                            title="No practice sessions yet"
                            description="Once you complete a session, your score and full transcript will show up here so you can track whether you're actually improving."
                        />
                    ) : (
                        <ul className="session-list">
                            {pastSessions.map((session) => (
                                <li key={session._id}>
                                    <Link to={`/practice/${session._id}`} className="session-list__item">
                                        <div className="session-list__main">
                                            <h3>{session.title}</h3>
                                            <p>
                                                {session.mode} &middot;{" "}
                                                {new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                {session.status === "in_progress" && " · in progress"}
                                            </p>
                                        </div>
                                        {session.status === "completed" ? (
                                            <span className={`session-list__score session-list__score--${scoreTone(session.report?.overallScore)}`}>
                                                {Math.round(session.report?.overallScore ?? 0)}
                                            </span>
                                        ) : (
                                            <Badge variant="warning">Resume</Badge>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    )
}

export default PracticeSetup
