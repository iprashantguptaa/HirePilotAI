import { useState } from "react"
import { Link } from "react-router"
import { Badge, Button } from "../../../components/ui"
import RubricBreakdown from "./RubricBreakdown"
import { scoreTone, scoreLabel, RUBRIC_DIMENSIONS } from "../practice.utils"

/**
 * Finds the rubric dimension the candidate scored lowest on across the whole
 * session. A single weak answer is noise; the weakest *average* dimension is
 * the thing worth practising next.
 */
function weakestDimension(rubricAverages) {
    if (!rubricAverages) return null

    return RUBRIC_DIMENSIONS
        .map((dimension) => ({ ...dimension, score: rubricAverages[ dimension.key ] }))
        .filter((dimension) => typeof dimension.score === "number")
        .sort((a, b) => a.score - b.score)[ 0 ] || null
}

const SessionReport = ({ session }) => {
    const [ openTurn, setOpenTurn ] = useState(null)

    const report = session?.report
    if (!report) return null

    const tone = scoreTone(report.overallScore)
    const weakest = weakestDimension(report.rubricAverages)

    return (
        <div className="session-report">
            <header className="session-report__hero">
                <div className={`score-dial score-dial--lg score-dial--${tone}`}>
                    <span className="score-dial__value">{Math.round(report.overallScore ?? 0)}</span>
                    <span className="score-dial__unit">/100</span>
                </div>

                <div className="session-report__summary">
                    <Badge variant={tone === "high" ? "success" : tone === "mid" ? "warning" : "error"}>
                        {scoreLabel(report.overallScore)}
                    </Badge>
                    <h1>{session.title}</h1>
                    <p className="session-report__meta">
                        {session.turns?.length || 0} question{(session.turns?.length || 0) === 1 ? "" : "s"} answered
                        {" "}&middot;{" "}{session.mode} interview
                        {session.completedAt && <> &middot; {new Date(session.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
                    </p>
                    {report.verdict && <p className="session-report__verdict">{report.verdict}</p>}
                </div>
            </header>

            <section className="session-report__panel">
                <h2>Where you stand</h2>
                <RubricBreakdown rubric={report.rubricAverages} showHints />
                {weakest && (
                    <p className="session-report__weakest">
                        Your weakest dimension across this session was <strong>{weakest.label.toLowerCase()}</strong>
                        {" "}at {Math.round(weakest.score)}/100. {weakest.hint}
                    </p>
                )}
            </section>

            <div className="session-report__columns">
                {report.strengths?.length > 0 && (
                    <section className="session-report__panel">
                        <h2>What you did well</h2>
                        <ul className="session-report__list session-report__list--positive">
                            {report.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </section>
                )}

                {report.weaknesses?.length > 0 && (
                    <section className="session-report__panel">
                        <h2>Recurring problems</h2>
                        <ul className="session-report__list session-report__list--gap">
                            {report.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </section>
                )}
            </div>

            {report.recommendations?.length > 0 && (
                <section className="session-report__panel">
                    <h2>Do these before your real interview</h2>
                    <ol className="session-report__list session-report__list--actions">
                        {report.recommendations.map((item, index) => <li key={index}>{item}</li>)}
                    </ol>
                </section>
            )}

            <section className="session-report__panel">
                <h2>Full transcript</h2>
                <ul className="transcript">
                    {(session.turns || []).map((turn) => {
                        const isOpen = openTurn === turn.questionNumber
                        const turnTone = scoreTone(turn.overallScore)

                        return (
                            <li key={turn.questionNumber} className="transcript__item">
                                <button
                                    type="button"
                                    className="transcript__header"
                                    onClick={() => setOpenTurn(isOpen ? null : turn.questionNumber)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={`transcript__score transcript__score--${turnTone}`}>
                                        {Math.round(turn.overallScore ?? 0)}
                                    </span>
                                    <span className="transcript__question">
                                        {turn.question}
                                        {turn.isFollowUp && <em className="transcript__tag">follow-up</em>}
                                    </span>
                                    <svg
                                        className={`transcript__chevron ${isOpen ? "transcript__chevron--open" : ""}`}
                                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {isOpen && (
                                    <div className="transcript__body">
                                        <h4>Your answer</h4>
                                        <p className="transcript__answer">{turn.answer}</p>
                                        <RubricBreakdown rubric={turn.rubric} />
                                        {turn.feedback?.whatWasMissing && (
                                            <div className="feedback-note feedback-note--gap">
                                                <h4>What was missing</h4>
                                                <p>{turn.feedback.whatWasMissing}</p>
                                            </div>
                                        )}
                                        {turn.feedback?.improvedAnswer && (
                                            <div className="feedback-note">
                                                <h4>A stronger version</h4>
                                                <p>{turn.feedback.improvedAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </section>

            <footer className="session-report__footer">
                <Link to="/practice">
                    <Button variant="primary" size="lg">Practise again</Button>
                </Link>
                {session.interviewReport && (
                    <Link to={`/interview/${session.interviewReport}`}>
                        <Button variant="secondary" size="lg">Back to interview plan</Button>
                    </Link>
                )}
            </footer>
        </div>
    )
}

export default SessionReport
