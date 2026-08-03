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

    const currentQuestionNumber = currentQuestion?.questionNumber
    const hasOpenQuestion = Boolean(currentQuestion) && !reveal && !isComplete

    // Focus the answer box whenever a new question comes up so the candidate
    // can start typing without reaching for the mouse.
    useEffect(() => {
        if (hasOpenQuestion) {
            answerRef.current?.focus()
        }
    }, [ hasOpenQuestion, currentQuestionNumber ])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const succeeded = await answer(draft)
        if (succeeded) setDraft("")
    }

    const handleContinue = () => {
        if (reveal?.completed) return
        continueToNext()
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

    if (isComplete) {
        return (
            <>
                <SEO title={`${session.title} — Practice Report | HirePilot AI`} />
                <div className="practice-session container">
                    <SessionReport session={session} />
                </div>
            </>
        )
    }

    const total = session.plannedQuestions
    const progressPercent = Math.min((answeredCount / total) * 100, 100)

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
                        variant="ghost"
                        onClick={finishEarly}
                        loading={finishing}
                        disabled={answeredCount === 0}
                        title={answeredCount === 0 ? "Answer at least one question first" : "End the session and get your report"}
                    >
                        End &amp; get report
                    </Button>
                </header>

                <div className="practice-session__progress">
                    <div className="practice-session__progress-track">
                        <div
                            className="practice-session__progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span>{answeredCount} of {total} answered</span>
                </div>

                {reveal ? (
                    <AnswerFeedback
                        turn={reveal.scoredTurn}
                        onContinue={handleContinue}
                        continueLabel={reveal.completed ? "See your report" : "Next question"}
                        busy={false}
                    />
                ) : currentQuestion ? (
                    <form className="question-card" onSubmit={handleSubmit}>
                        <div className="question-card__meta">
                            <span className="question-card__number">
                                Question {currentQuestion.questionNumber}
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
                        <p>This session has no question waiting. Wrap it up to see your report.</p>
                        <Button variant="primary" onClick={finishEarly} loading={finishing}>
                            Get my report
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}

export default PracticeSession
