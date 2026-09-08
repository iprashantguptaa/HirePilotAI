import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router"
import "../style/interview.scss"
import { useInterview } from "../hooks/useInterview.js"
import { useAuth } from "../../auth/hooks/useAuth.js"
import ChatPanel from "../../chat/components/ChatPanel.jsx"
import { ErrorState } from "../../../components/ui"
import { SEO } from "../../../components/common"
import {
    buildPriorityActions,
    filterQuestionsByGap,
    findTodaysRoadmapFocus,
    SEVERITY_RANK
} from "../utils/priorityActions.js"

const NAV_ITEMS = [
    { id: "hub", label: "Results Hub", short: "Hub" },
    { id: "technical", label: "Technical", short: "Tech" },
    { id: "behavioral", label: "Behavioral", short: "Beh" },
    { id: "roadmap", label: "Roadmap", short: "Plan" },
    { id: "assistant", label: "Assistant", short: "Chat" }
]

function scoreTone(score) {
    if (score >= 80) return "high"
    if (score >= 60) return "mid"
    return "low"
}

function scoreCaption(score) {
    if (score >= 80) return "Strong match for this role"
    if (score >= 60) return "Solid fit — close a few gaps"
    return "Stretch role — prioritize the gaps below"
}

function useCountUp(target, duration = 900) {
    const safe = Math.max(0, Math.min(100, Number(target) || 0))
    const [ value, setValue ] = useState(0)

    useEffect(() => {
        const reduce = typeof window !== "undefined"
            && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduce) {
            setValue(safe)
            return
        }

        let frame
        const start = performance.now()
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - (1 - t) ** 3
            setValue(Math.round(safe * eased))
            if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [ safe, duration ])

    return value
}

function ScoreRingStatic({ score }) {
    const tone = scoreTone(score)
    const safe = Math.max(0, Math.min(100, Number(score) || 0))
    const radius = 54
    const circ = 2 * Math.PI * radius
    const offset = circ - (safe / 100) * circ

    return (
        <div className={`score-ring score-ring--${tone}`} role="img" aria-label={`Match score ${safe} percent`}>
            <svg viewBox="0 0 128 128" className="score-ring__svg" aria-hidden="true">
                <circle className="score-ring__track" cx="64" cy="64" r={radius} />
                <circle
                    className="score-ring__progress"
                    cx="64"
                    cy="64"
                    r={radius}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-ring__center">
                <span className="score-ring__value">{safe}</span>
                <span className="score-ring__unit">%</span>
            </div>
        </div>
    )
}

function ScoreRingAnimated({ score }) {
    const display = useCountUp(score)
    const tone = scoreTone(score)
    const safe = Math.max(0, Math.min(100, Number(score) || 0))
    const radius = 54
    const circ = 2 * Math.PI * radius
    const offset = circ - (safe / 100) * circ

    return (
        <div className={`score-ring score-ring--${tone}`} role="img" aria-label={`Match score ${display} percent`}>
            <svg viewBox="0 0 128 128" className="score-ring__svg" aria-hidden="true">
                <circle className="score-ring__track" cx="64" cy="64" r={radius} />
                <circle
                    className="score-ring__progress"
                    cx="64"
                    cy="64"
                    r={radius}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-ring__center">
                <span className="score-ring__value">{display}</span>
                <span className="score-ring__unit">%</span>
            </div>
        </div>
    )
}

function ScoreRing({ score, animated = false }) {
    return animated ? <ScoreRingAnimated score={score} /> : <ScoreRingStatic score={score} />
}

function MetricRow({ label, value }) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0))
    return (
        <div className="metric-row">
            <div className="metric-row__top">
                <span className="metric-row__label">{label}</span>
                <span className="metric-row__value">{safe}%</span>
            </div>
            <div className="metric-row__track" aria-hidden="true">
                <div className="metric-row__fill" style={{ width: `${safe}%` }} />
            </div>
        </div>
    )
}

function practiceUrl(interviewId, { focus, q, note } = {}) {
    const params = new URLSearchParams({ report: interviewId })
    if (focus) params.set("focus", focus)
    if (typeof q === "number" && Number.isFinite(q)) params.set("q", String(q))
    if (note) params.set("note", note.slice(0, 280))
    return `/practice?${params.toString()}`
}

function QuestionCard({
    item,
    index,
    defaultOpen = false,
    interviewId,
    bookmarked,
    onToggleBookmark,
    focusMode = "mixed",
    sourceIndex
}) {
    const [ open, setOpen ] = useState(defaultOpen)
    const [ copied, setCopied ] = useState(false)
    const panelId = `q-panel-${index}`
    const qIndex = typeof sourceIndex === "number" ? sourceIndex : index

    const copyQuestion = async (e) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(item.question || "")
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // ignore
        }
    }

    return (
        <article className={`q-card ${open ? "q-card--open" : ""} ${bookmarked ? "q-card--bookmarked" : ""}`}>
            <button
                type="button"
                className="q-card__header"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="q-card__index">Q{index + 1}</span>
                <span className="q-card__question">{item.question}</span>
                <span className="q-card__chevron" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>
            {open && (
                <div className="q-card__body" id={panelId}>
                    <div className="q-card__actions">
                        <button type="button" className="q-card__copy" onClick={copyQuestion}>
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                            type="button"
                            className={`q-card__copy ${bookmarked ? "q-card__copy--on" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleBookmark?.(qIndex)
                            }}
                            aria-pressed={bookmarked}
                        >
                            {bookmarked ? "Bookmarked" : "Bookmark"}
                        </button>
                        <Link
                            to={practiceUrl(interviewId, {
                                focus: focusMode,
                                q: qIndex,
                                note: item.question
                            })}
                            className="q-card__practice"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Practice this
                        </Link>
                    </div>
                    {item.intention && (
                        <div className="q-card__block">
                            <h4>What they&apos;re assessing</h4>
                            <p>{item.intention}</p>
                        </div>
                    )}
                    {item.answer && (
                        <div className="q-card__block">
                            <h4>Stronger answer shape</h4>
                            <p>{item.answer}</p>
                        </div>
                    )}
                </div>
            )}
        </article>
    )
}

function RoadmapDay({ day, checked, onToggle, isFocus }) {
    return (
        <li className={`roadmap-day ${isFocus ? "roadmap-day--focus" : ""}`}>
            <div className="roadmap-day__rail" aria-hidden="true" />
            <div className="roadmap-day__card">
                <header className="roadmap-day__head">
                    <span className="roadmap-day__badge">
                        Day {day.day}{isFocus ? " · Today" : ""}
                    </span>
                    <h3>{day.focus}</h3>
                </header>
                <ul className="roadmap-day__tasks">
                    {(day.tasks || []).map((task, i) => {
                        const key = `${day.day}-${i}`
                        const isOn = Boolean(checked[ key ])
                        return (
                            <li key={key}>
                                <label className={`roadmap-task ${isOn ? "roadmap-task--done" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={isOn}
                                        onChange={() => onToggle(key)}
                                    />
                                    <span>{task}</span>
                                </label>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </li>
    )
}

const Interview = () => {
    const [ activeNav, setActiveNav ] = useState("hub")
    const [ expandAll, setExpandAll ] = useState(false)
    const [ checkedTasks, setCheckedTasks ] = useState({})
    const [ activeGap, setActiveGap ] = useState(null)
    const [ bookmarks, setBookmarks ] = useState({ technical: [], behavioral: [] })
    const [ loadError, setLoadError ] = useState(null)
    const [ searchParams, setSearchParams ] = useSearchParams()
    const { report, getReportById, loading, getResumePdf, getReportPdf } = useInterview()
    const { user } = useAuth()
    const { interviewId } = useParams()

    // Namespaced by user: without this, two accounts sharing a browser read
    // each other's roadmap checkboxes and bookmarks.
    const scope = user?.id || user?._id || "anon"
    const roadmapKey = `hp_roadmap_${scope}_${interviewId}`
    const bookmarksKey = `hp_bookmarks_${scope}_${interviewId}`

    const loadReport = async () => {
        if (!interviewId) return
        setLoadError(null)
        const loaded = await getReportById(interviewId)
        if (!loaded) setLoadError("Couldn't load your interview plan.")
    }

    useEffect(() => {
        loadReport()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ interviewId ])

    useEffect(() => {
        if (!interviewId) return
        try {
            const raw = localStorage.getItem(roadmapKey)
            setCheckedTasks(raw ? JSON.parse(raw) : {})
        } catch {
            setCheckedTasks({})
        }
        try {
            const bm = localStorage.getItem(bookmarksKey)
            setBookmarks(bm ? JSON.parse(bm) : { technical: [], behavioral: [] })
        } catch {
            setBookmarks({ technical: [], behavioral: [] })
        }
    }, [ interviewId, roadmapKey, bookmarksKey ])

    // Practice completion return chip
    const practiceDone = searchParams.get("practiced")
    useEffect(() => {
        if (!practiceDone) return
        const t = window.setTimeout(() => {
            searchParams.delete("practiced")
            setSearchParams(searchParams, { replace: true })
        }, 8000)
        return () => clearTimeout(t)
    }, [ practiceDone, searchParams, setSearchParams ])

    const toggleTask = (key) => {
        setCheckedTasks((prev) => {
            const next = { ...prev, [ key ]: !prev[ key ] }
            try {
                localStorage.setItem(roadmapKey, JSON.stringify(next))
            } catch {
                // ignore
            }
            return next
        })
    }

    const toggleBookmark = (kind, index) => {
        setBookmarks((prev) => {
            const list = new Set(prev[ kind ] || [])
            if (list.has(index)) list.delete(index)
            else list.add(index)
            const next = { ...prev, [ kind ]: [ ...list ] }
            try {
                localStorage.setItem(bookmarksKey, JSON.stringify(next))
            } catch {
                // ignore
            }
            return next
        })
    }

    const breakdown = report?.scoreBreakdown
    const techQs = report?.technicalQuestions || []
    const behQs = report?.behavioralQuestions || []
    const plan = report?.preparationPlan || []
    const gaps = report?.skillGaps || []
    const strengths = report?.strengths || []

    const priorityActions = useMemo(() => buildPriorityActions(report), [ report ])
    const rankedGaps = useMemo(
        () => [ ...gaps ]
            .sort((a, b) => (SEVERITY_RANK[ b.severity ] || 0) - (SEVERITY_RANK[ a.severity ] || 0))
            .slice(0, 6),
        [ gaps ]
    )
    const todayFocus = useMemo(
        () => findTodaysRoadmapFocus(plan, checkedTasks),
        [ plan, checkedTasks ]
    )

    const filteredTech = useMemo(
        () => (activeGap ? filterQuestionsByGap(techQs, activeGap) : techQs),
        [ techQs, activeGap ]
    )
    const filteredBeh = useMemo(
        () => (activeGap ? filterQuestionsByGap(behQs, activeGap) : behQs),
        [ behQs, activeGap ]
    )

    const roadmapProgress = useMemo(() => {
        const total = plan.reduce((sum, day) => sum + (day.tasks?.length || 0), 0)
        if (!total) return 0
        const done = Object.values(checkedTasks).filter(Boolean).length
        return Math.round((done / total) * 100)
    }, [ plan, checkedTasks ])

    const handleGapClick = (skill) => {
        const next = activeGap === skill ? null : skill
        setActiveGap(next)
        setActiveNav("hub")
        window.requestAnimationFrame(() => {
            const target = document.getElementById(next ? "related-questions" : "ir-main")
            target?.focus?.()
            target?.scrollIntoView?.({ behavior: "smooth", block: "start" })
        })
    }

    const handlePriorityAction = (action) => {
        if (action.target === "roadmap") {
            setActiveNav("roadmap")
            return
        }
        if (action.target === "gap" && action.gapSkill) {
            setActiveGap(action.gapSkill)
            setActiveNav("hub")
            window.requestAnimationFrame(() => {
                document.getElementById("related-questions")?.scrollIntoView?.({ behavior: "smooth", block: "start" })
            })
        }
    }

    if (loading || (!report && !loadError)) {
        return (
            <main className="ir-loading" aria-busy="true">
                <div className="ir-loading__spinner" aria-hidden="true" />
                <h1>Loading your interview plan…</h1>
                <p>Pulling score, questions, and roadmap.</p>
            </main>
        )
    }

    if (loadError) {
        return (
            <main className="ir">
                <ErrorState
                    title="Couldn't load your interview plan"
                    description="Something went wrong on our end. Check your connection and try again."
                    action={
                        <button type="button" className="ir-btn ir-btn--primary" onClick={loadReport}>
                            Try again
                        </button>
                    }
                />
            </main>
        )
    }

    const match = Number(report.matchScore) || 0
    const weakestDims = breakdown
        ? [
            { label: "Technical", value: breakdown.technicalSkills },
            { label: "Communication", value: breakdown.communication },
            { label: "Experience", value: breakdown.experience },
            { label: "Culture", value: breakdown.cultureFit }
        ]
            .filter((d) => Number.isFinite(Number(d.value)))
            .sort((a, b) => a.value - b.value)
            .slice(0, 2)
        : []

    return (
        <div className="ir">
            <SEO title={report.title ? `${report.title} — Interview Plan` : "Interview Plan"} noIndex />
            <header className="ir-top">
                <div className="ir-top__copy">
                    <p className="ir-top__eyebrow">Prep workspace</p>
                    <h1>{report.title || "Untitled role"}</h1>
                    <p className="ir-top__meta">
                        Match <strong>{match}%</strong>
                        <span aria-hidden="true"> · </span>
                        {scoreCaption(match)}
                    </p>
                    {practiceDone && (
                        <p className="ir-chip" role="status">
                            You completed {practiceDone} practice answer{Number(practiceDone) === 1 ? "" : "s"} — keep closing gaps below.
                        </p>
                    )}
                </div>
                <div className="ir-top__actions">
                    <Link to={practiceUrl(interviewId)} className="ir-btn ir-btn--primary">
                        Practice this plan
                    </Link>
                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => window.print()}>
                        Print one-pager
                    </button>
                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => getReportPdf(interviewId)}>
                        Download report
                    </button>
                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => getResumePdf(interviewId)}>
                        Download resume
                    </button>
                </div>
            </header>

            <div className="ir-shell">
                <nav className="ir-nav" aria-label="Plan sections">
                    <p className="ir-nav__label">Sections</p>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`ir-nav__item ${activeNav === item.id ? "ir-nav__item--active" : ""}`}
                            onClick={() => setActiveNav(item.id)}
                            aria-current={activeNav === item.id ? "page" : undefined}
                        >
                            <span className="ir-nav__short">{item.short}</span>
                            <span className="ir-nav__full">{item.label}</span>
                        </button>
                    ))}
                    <div className="ir-nav__cta">
                        <Link to={practiceUrl(interviewId)} className="ir-btn ir-btn--primary ir-btn--block">
                            Start scored practice
                        </Link>
                    </div>
                </nav>

                <main className="ir-main motion-crossfade" id="ir-main" tabIndex={-1} key={activeNav}>
                    {activeNav === "hub" && (
                        <section className="ir-section ir-hub" aria-labelledby="hub-title">
                            <header className="ir-section__head">
                                <h2 id="hub-title">Results Hub</h2>
                                <p>What to do in the next 30 minutes — then dig into questions and the roadmap.</p>
                            </header>

                            <div className={`ir-verdict ir-verdict--${scoreTone(match)} print-block`}>
                                <div className="ir-verdict__score">
                                    <ScoreRing score={match} animated />
                                    <p className="ir-verdict__score-label">Match score</p>
                                </div>

                                <div className="ir-verdict__copy">
                                    <p className="ir-verdict__tag">{scoreCaption(match)}</p>
                                    <p className="ir-verdict__lede">
                                        {match >= 80
                                            ? "You clear the bar on paper. Use the next 30 minutes to sharpen delivery, not to relearn fundamentals."
                                            : match >= 60
                                                ? "You are in range. Closing the two weakest dimensions below is what moves this into a confident yes."
                                                : "The gaps below are what a screener will catch first. Fix the highest-severity one before you apply."}
                                    </p>

                                    {weakestDims.length > 0 && (
                                        <>
                                            <p className="ir-verdict__weak-label">Weakest dimensions</p>
                                            <ul className="ir-verdict__weak">
                                                {weakestDims.map((d) => (
                                                    <li key={d.label} className="ir-verdict__weak-item">
                                                        <span className="ir-verdict__weak-name">{d.label}</span>
                                                        <span
                                                            className="ir-verdict__weak-track"
                                                            aria-hidden="true"
                                                        >
                                                            <span
                                                                className="ir-verdict__weak-fill"
                                                                style={{ width: `${Math.max(0, Math.min(100, d.value))}%` }}
                                                            />
                                                        </span>
                                                        <span className="ir-verdict__weak-value">{d.value}%</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="ir-panel ir-priority print-block">
                                <h3>Next 30 minutes</h3>
                                <ol className="ir-priority__list">
                                    {priorityActions.map((action, i) => (
                                        <li key={action.id} className="ir-priority__item">
                                            <span className="ir-priority__n">{i + 1}</span>
                                            <div>
                                                <h4>{action.title}</h4>
                                                <p>{action.detail}</p>
                                            </div>
                                            {action.target === "practice" ? (
                                                <Link
                                                    to={practiceUrl(interviewId, {
                                                        focus: action.focus || "mixed",
                                                        note: action.gapSkill || action.title
                                                    })}
                                                    className="ir-btn ir-btn--primary"
                                                >
                                                    {action.cta}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ir-btn ir-btn--ghost"
                                                    onClick={() => handlePriorityAction(action)}
                                                >
                                                    {action.cta}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {rankedGaps.length > 0 && (
                                <div className="ir-panel print-block">
                                    <div className="ir-panel__head">
                                        <h3>Top skill gaps</h3>
                                        {activeGap && (
                                            <button
                                                type="button"
                                                className="ir-btn ir-btn--ghost ir-btn--sm"
                                                onClick={() => setActiveGap(null)}
                                            >
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                    <p className="ir-panel__hint">
                                        Sorted by severity. Select a gap to filter the questions that test it.
                                    </p>
                                    <ul className="ir-gaps ir-gaps--interactive">
                                        {rankedGaps.map((gap, i) => {
                                            const severity = gap.severity || "medium"
                                            const isActive = activeGap === gap.skill
                                            return (
                                                <li key={`${gap.skill}-${i}`}>
                                                    <button
                                                        type="button"
                                                        className={`ir-gap ir-gap--btn ir-gap--${severity} ${isActive ? "ir-gap--active" : ""}`}
                                                        onClick={() => handleGapClick(gap.skill)}
                                                        aria-pressed={isActive}
                                                    >
                                                        <span className="ir-gap__rank" aria-hidden="true">{i + 1}</span>
                                                        <span className="ir-gap__body">
                                                            <span className="ir-gap__skill">{gap.skill}</span>
                                                            <span className="ir-gap__sev">
                                                                <span className="ir-gap__dot" aria-hidden="true" />
                                                                {severity} priority
                                                            </span>
                                                        </span>
                                                        <span className="ir-gap__action" aria-hidden="true">
                                                            {isActive ? "Filtering" : "Filter"}
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}

                            {activeGap && (
                            <div
                                className="ir-panel ir-related print-block"
                                id="related-questions"
                                tabIndex={-1}
                            >
                                <h3>Related questions</h3>
                                <p className="ir-panel__hint" aria-live="polite">
                                    Filtered for “{activeGap}”. {filteredTech.length} technical and {filteredBeh.length} behavioral match{filteredTech.length + filteredBeh.length === 1 ? "" : "es"}.
                                </p>
                                {filteredTech.length + filteredBeh.length === 0 ? (
                                    <div className="ir-empty">
                                        No questions mention this gap yet. Clear the filter or practice the gap directly.
                                    </div>
                                ) : (
                                    <>
                                        {filteredTech.length > 0 && (
                                            <div className="ir-qlist">
                                                <p className="ir-related__label">Technical</p>
                                                {filteredTech.map((q, i) => (
                                                    <QuestionCard
                                                        key={`hub-tech-${activeGap}-${i}`}
                                                        item={q}
                                                        index={i}
                                                        sourceIndex={q._sourceIndex ?? i}
                                                        defaultOpen={i === 0}
                                                        interviewId={interviewId}
                                                        bookmarked={(bookmarks.technical || []).includes(q._sourceIndex ?? i)}
                                                        onToggleBookmark={(idx) => toggleBookmark("technical", idx)}
                                                        focusMode="technical"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {filteredBeh.length > 0 && (
                                            <div className="ir-qlist">
                                                <p className="ir-related__label">Behavioral</p>
                                                {filteredBeh.map((q, i) => (
                                                    <QuestionCard
                                                        key={`hub-beh-${activeGap}-${i}`}
                                                        item={q}
                                                        index={i}
                                                        sourceIndex={q._sourceIndex ?? i}
                                                        defaultOpen={i === 0 && filteredTech.length === 0}
                                                        interviewId={interviewId}
                                                        bookmarked={(bookmarks.behavioral || []).includes(q._sourceIndex ?? i)}
                                                        onToggleBookmark={(idx) => toggleBookmark("behavioral", idx)}
                                                        focusMode="behavioral"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            )}

                            {todayFocus && (
                                <div className="ir-next">
                                    <div>
                                        <h3>Today&apos;s roadmap focus</h3>
                                        <p>
                                            Day {todayFocus.day}: {todayFocus.focus} — start with “{todayFocus.task}”.
                                        </p>
                                    </div>
                                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => setActiveNav("roadmap")}>
                                        Open roadmap
                                    </button>
                                </div>
                            )}

                            {breakdown && (
                                <div className="ir-panel">
                                    <h3>Score breakdown</h3>
                                    <div className="ir-metrics">
                                        <MetricRow label="Technical skills" value={breakdown.technicalSkills} />
                                        <MetricRow label="Communication" value={breakdown.communication} />
                                        <MetricRow label="Experience" value={breakdown.experience} />
                                        <MetricRow label="Culture fit" value={breakdown.cultureFit} />
                                    </div>
                                </div>
                            )}

                            {strengths.length > 0 && (
                                <div className="ir-panel">
                                    <h3>Key strengths</h3>
                                    <ul className="ir-strengths">
                                        {strengths.map((s, i) => (
                                            <li key={i}>
                                                <strong>{s.skill}</strong>
                                                <p>{s.note}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    )}

                    {activeNav === "technical" && (
                        <section className="ir-section" aria-labelledby="tech-title">
                            <header className="ir-section__head ir-section__head--row">
                                <div>
                                    <h2 id="tech-title">Technical questions</h2>
                                    <p>
                                        {activeGap
                                            ? `Filtered for “${activeGap}” — ${filteredTech.length} match${filteredTech.length === 1 ? "" : "es"}.`
                                            : `${techQs.length} questions grounded in this JD and your background.`}
                                    </p>
                                    <span className="sr-only" aria-live="polite">
                                        {activeGap
                                            ? `Showing ${filteredTech.length} technical questions related to ${activeGap}.`
                                            : "Showing all technical questions."}
                                    </span>
                                </div>
                                <div className="ir-section__tools">
                                    {activeGap && (
                                        <button type="button" className="ir-btn ir-btn--ghost" onClick={() => setActiveGap(null)}>
                                            Clear filter
                                        </button>
                                    )}
                                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => setExpandAll((v) => !v)}>
                                        {expandAll ? "Collapse all" : "Expand all"}
                                    </button>
                                </div>
                            </header>
                            {filteredTech.length === 0 ? (
                                <div className="ir-empty">
                                    No technical questions mention this gap. Try another gap or clear the filter.
                                </div>
                            ) : (
                                <div className="ir-qlist print-block">
                                    {filteredTech.map((q, i) => (
                                        <QuestionCard
                                            key={`${expandAll}-${activeGap}-${i}`}
                                            item={q}
                                            index={i}
                                            sourceIndex={q._sourceIndex ?? i}
                                            defaultOpen={expandAll}
                                            interviewId={interviewId}
                                            bookmarked={(bookmarks.technical || []).includes(q._sourceIndex ?? i)}
                                            onToggleBookmark={(idx) => toggleBookmark("technical", idx)}
                                            focusMode="technical"
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeNav === "behavioral" && (
                        <section className="ir-section" aria-labelledby="beh-title">
                            <header className="ir-section__head ir-section__head--row">
                                <div>
                                    <h2 id="beh-title">Behavioral questions</h2>
                                    <p>
                                        {activeGap
                                            ? `Filtered for “${activeGap}” — ${filteredBeh.length} match${filteredBeh.length === 1 ? "" : "es"}.`
                                            : `${behQs.length} questions for ownership, conflict, and communication.`}
                                    </p>
                                    <span className="sr-only" aria-live="polite">
                                        {activeGap
                                            ? `Showing ${filteredBeh.length} behavioral questions related to ${activeGap}.`
                                            : "Showing all behavioral questions."}
                                    </span>
                                </div>
                                <div className="ir-section__tools">
                                    {activeGap && (
                                        <button type="button" className="ir-btn ir-btn--ghost" onClick={() => setActiveGap(null)}>
                                            Clear filter
                                        </button>
                                    )}
                                    <button type="button" className="ir-btn ir-btn--ghost" onClick={() => setExpandAll((v) => !v)}>
                                        {expandAll ? "Collapse all" : "Expand all"}
                                    </button>
                                </div>
                            </header>
                            {filteredBeh.length === 0 ? (
                                <div className="ir-empty">
                                    No behavioral questions mention this gap. Try another gap or clear the filter.
                                </div>
                            ) : (
                                <div className="ir-qlist print-block">
                                    {filteredBeh.map((q, i) => (
                                        <QuestionCard
                                            key={`${expandAll}-${activeGap}-${i}`}
                                            item={q}
                                            index={i}
                                            sourceIndex={q._sourceIndex ?? i}
                                            defaultOpen={expandAll}
                                            interviewId={interviewId}
                                            bookmarked={(bookmarks.behavioral || []).includes(q._sourceIndex ?? i)}
                                            onToggleBookmark={(idx) => toggleBookmark("behavioral", idx)}
                                            focusMode="behavioral"
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeNav === "roadmap" && (
                        <section className="ir-section" aria-labelledby="map-title">
                            <header className="ir-section__head">
                                <h2 id="map-title">Preparation roadmap</h2>
                                <p>
                                    {plan.length}-day plan. Check off tasks as you go —
                                    progress is saved on this device ({roadmapProgress}% done).
                                </p>
                            </header>
                            {todayFocus && (
                                <div className="ir-chip ir-chip--block" role="status">
                                    Today&apos;s focus — Day {todayFocus.day}: {todayFocus.focus}
                                </div>
                            )}
                            <div className="ir-progress" aria-label={`Roadmap progress ${roadmapProgress}%`}>
                                <div className="ir-progress__track">
                                    <div className="ir-progress__fill" style={{ width: `${roadmapProgress}%` }} />
                                </div>
                                <span>{roadmapProgress}%</span>
                            </div>
                            <ol className="ir-roadmap">
                                {plan.map((day) => (
                                    <RoadmapDay
                                        key={day.day}
                                        day={day}
                                        checked={checkedTasks}
                                        onToggle={toggleTask}
                                        isFocus={todayFocus?.day === day.day}
                                    />
                                ))}
                            </ol>
                        </section>
                    )}

                    {activeNav === "assistant" && (
                        <section className="ir-section ir-section--chat" aria-labelledby="chat-title">
                            <header className="ir-section__head">
                                <h2 id="chat-title">AI interview assistant</h2>
                                <p>Practice out loud with an interviewer that knows this resume and job description.</p>
                            </header>
                            <div className="ir-chat">
                                <ChatPanel interviewId={interviewId} />
                            </div>
                        </section>
                    )}
                </main>
            </div>

            <section className="ir-print-only" aria-hidden="true">
                <h2>{report.title || "Interview plan"}</h2>
                <p>Match {match}%. {scoreCaption(match)}</p>
                <h3>Skill gaps</h3>
                <ul>
                    {gaps.map((gap, i) => (
                        <li key={i}>{gap.skill}{gap.severity ? ` (${gap.severity})` : ""}</li>
                    ))}
                </ul>
                <h3>Technical questions</h3>
                <ol>
                    {techQs.map((q, i) => (
                        <li key={i}>
                            <p>{q.question}</p>
                            {q.intention && <p>{q.intention}</p>}
                            {q.answer && <p>{q.answer}</p>}
                        </li>
                    ))}
                </ol>
                <h3>Behavioral questions</h3>
                <ol>
                    {behQs.map((q, i) => (
                        <li key={i}>
                            <p>{q.question}</p>
                            {q.intention && <p>{q.intention}</p>}
                            {q.answer && <p>{q.answer}</p>}
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    )
}

export default Interview
