import { useState } from "react"
import { Badge, Button } from "../../../components/ui"
import RubricBreakdown from "./RubricBreakdown"
import { scoreTone, scoreLabel } from "../practice.utils"

/**
 * The graded result for a single answer. The stronger model answer is behind a
 * toggle rather than shown by default -- reading it before absorbing your own
 * gaps turns practice into passive copying.
 */
const AnswerFeedback = ({ turn, onContinue, continueLabel = "Next question", busy = false, hint = null }) => {
    const [ showImproved, setShowImproved ] = useState(false)

    if (!turn) return null

    const tone = scoreTone(turn.overallScore)

    return (
        <section className="answer-feedback" aria-live="polite">
            <header className="answer-feedback__head">
                <div className={`score-dial score-dial--${tone}`}>
                    <span className="score-dial__value">{Math.round(turn.overallScore ?? 0)}</span>
                    <span className="score-dial__unit">/100</span>
                </div>
                <div className="answer-feedback__verdict">
                    <Badge variant={tone === "high" ? "success" : tone === "mid" ? "warning" : "error"}>
                        {scoreLabel(turn.overallScore)}
                    </Badge>
                    {turn.scoringMode === "basic" && (
                        <Badge variant="warning">Basic scoring (AI busy)</Badge>
                    )}
                    <h3>How that answer scored</h3>
                    <p>Question {turn.questionNumber}{turn.isFollowUp ? " (follow-up)" : ""} &middot; {turn.category}</p>
                    {turn.scoringMode === "basic" && (
                        <p className="answer-feedback__degraded">
                            Full AI coaching was unavailable, so this used a basic local rubric. You can still continue the interview.
                        </p>
                    )}
                </div>
            </header>

            <RubricBreakdown rubric={turn.rubric} />

            <div className="answer-feedback__notes">
                {turn.feedback?.whatWorked && (
                    <div className="feedback-note feedback-note--positive">
                        <h4>What worked</h4>
                        <p>{turn.feedback.whatWorked}</p>
                    </div>
                )}

                {turn.feedback?.whatWasMissing && (
                    <div className="feedback-note feedback-note--gap">
                        <h4>What was missing</h4>
                        <p>{turn.feedback.whatWasMissing}</p>
                    </div>
                )}
            </div>

            {turn.feedback?.improvedAnswer && (
                <div className="answer-feedback__improved">
                    <button
                        type="button"
                        className="answer-feedback__toggle"
                        onClick={() => setShowImproved((open) => !open)}
                        aria-expanded={showImproved}
                    >
                        {showImproved ? "Hide" : "Show"} a stronger version of this answer
                    </button>
                    {showImproved && (
                        <blockquote className="answer-feedback__model">
                            {turn.feedback.improvedAnswer}
                        </blockquote>
                    )}
                </div>
            )}

            {onContinue && (
                <div className="answer-feedback__actions">
                    <Button type="button" variant="primary" size="lg" onClick={onContinue} loading={busy}>
                        {busy ? "Preparing next question…" : continueLabel}
                    </Button>
                    {hint && !busy && (
                        <small className="answer-feedback__hint">{hint}</small>
                    )}
                </div>
            )}
        </section>
    )
}

export default AnswerFeedback
