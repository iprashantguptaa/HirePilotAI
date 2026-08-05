import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router"
import { Button, Textarea, Badge, SkeletonCard } from "../../../components/ui"
import { SEO } from "../../../components/common"
import { usePracticeSession } from "../hooks/usePracticeSession"
import AnswerFeedback from "../components/AnswerFeedback"
import SessionReport from "../components/SessionReport"
import "../style/practice.scss"

const MAX_ANSWER_LENGTH = 5000

const PracticeSession = () => {
    const { sessionId } = useParams()
    const {
        session,
        loading,
        submitting,
        finishing,
        advancing,
        reveal,
        currentQuestion,
        answeredCount,
        isComplete,
        answer,
        continueToNext,
        finishEarly
    } = usePracticeSession(sessionId)

    const [ draft, setDraft ] = useState("")
    const answerRef = useRef(null)

    const questionNumber = currentQuestion?.questionNumber
        ?? (answeredCount + 1)
    const hasOpenQuestion = Boolean(currentQuestion) && !reveal && !isComplete

    // Focus the answer box whenever a new question comes up so the candidate
    // can start typing without reaching for the mouse.
    useEffect(() => {
        if (hasOpenQuestion) {
            answerRef.current?.focus()
        }
    }, [ hasOpenQuestion, questionNumber ])

    const handleSubmit = async (event) => {
        event.preventDefault()
        event.stopPropagation()
        const succeeded = await answer(draft)
        if (succeeded) setDraft("")
    }

    const handleContinue = async () => {
        await continueToNext()
    }

    if (loading) {
        return (
            <div className="practice-session container">
                <SkeletonCard height="3rem" />
                <SkeletonCard height="10rem" />
                <SkeletonCard height="12rem" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="practice-session container">
                <div className="practice-session__missing">
                    <h1>Session not found</h1>
                    <p>This practice session doesn't exist, or it belongs to another account.</p>
                    <Link to="/practice"><Button variant="primary">Start a new session</Button></Link>
                </div>
            </div>
        )
    }

    // Keep answer feedback on screen until the candidate continues — even if
    // the session just completed — so the last score isn't skipped.
    if (isComplete && !reveal) {
        return (
            <>
                <SEO title={`${session.title} — Practice Report | HirePilot AI`} />
                <div className="practice-session container">
                    <SessionReport session={session} />
                </div>
            </>
        )
    }

    const total = session.plannedQuestions || 6
    const progressPercent = Math.min((answeredCount / total) * 100, 100)
    const progressLabel = reveal
        ? `Answered ${Math.min(answeredCount, total)} of ${total}`
        : `Question ${questionNumber} of ${total}`

    return (
        <>
            <SEO title={`${session.title} — Mock Interview | HirePilot AI`} />

            <div className="practice-session container">
                <header className="practice-session__header">
                    <div>
                        <Badge variant="default">{session.mode} interview</Badge>
                        <h1>{session.title}</h1>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={finishEarly}
                        loading={finishing}
                        disabled={answeredCount === 0 || Boolean(reveal)}
                        title={answeredCount === 0 ? "Answer at least one question first" : "End the session and get your report"}
                    >
                        End &amp; get report
                    </Button>
                </header>

                <div className="practice-session__progress" aria-live="polite">
                    <div className="practice-session__progress-track">
                        <div
                            className="practice-session__progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="practice-session__progress-label">{progressLabel}</span>
                </div>

                {reveal ? (
                    <AnswerFeedback
                        turn={reveal.scoredTurn}
                        onContinue={handleContinue}
                        continueLabel={reveal.completed ? "See your report" : "Next question"}
                        busy={advancing}
                    />
                ) : advancing ? (
                    <div className="practice-session__missing">
                        <h2>Loading next question…</h2>
                        <p>Hang tight — the interviewer is preparing the next question.</p>
                    </div>
                ) : currentQuestion ? (
                    <form className="question-card" onSubmit={handleSubmit} action="#">
                        <div className="question-card__meta">
                            <span className="question-card__number">
                                Question {questionNumber} of {total}
                            </span>
                            <Badge variant={currentQuestion.category === "technical" ? "default" : "success"}>
                                {currentQuestion.category}
                            </Badge>
                            {currentQuestion.isFollowUp && (
                                <Badge variant="warning">Follow-up</Badge>
                            )}
                        </div>

                        <h2 className="question-card__question">{currentQuestion.question}</h2>

                        <Textarea
                            ref={answerRef}
                            label="Your answer"
                            placeholder="Answer as if you were speaking to the interviewer. Be specific -- use real examples and numbers from your own experience."
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            rows={10}
                            fullWidth
                            maxLength={MAX_ANSWER_LENGTH}
                            showCharacterCount
                            disabled={submitting}
                        />

                        <div className="question-card__actions">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={submitting}
                                disabled={!draft.trim()}
                            >
                                {submitting ? "Scoring your answer" : "Submit answer"}
                            </Button>
                            <small>Your answer is scored on relevance, depth, structure, clarity and specificity.</small>
                        </div>
                    </form>
                ) : (
                    <div className="practice-session__missing">
                        <h2>No open question</h2>
                        <p>This session has no question waiting. Load the next one, or wrap up for your report.</p>
                        <div className="practice-session__missing-actions">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleContinue}
                                loading={advancing}
                            >
                                Load next question
                            </Button>
                            <Button type="button" variant="secondary" onClick={finishEarly} loading={finishing}>
                                Get my report
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default PracticeSession
