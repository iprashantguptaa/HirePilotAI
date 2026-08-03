import { useCallback, useEffect, useState } from "react"
import { getSession, submitAnswer, completeSession } from "../services/practice.api"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
}

/**
 * Drives a live practice interview.
 *
 * The session advances in two beats rather than one: submitting an answer
 * reveals that answer's score and feedback, and the candidate then explicitly
 * moves on to the next question. Auto-advancing would mean the feedback -- the
 * whole point of practising -- flashes past unread.
 */
export function usePracticeSession(sessionId) {
    const [ session, setSession ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ submitting, setSubmitting ] = useState(false)
    const [ finishing, setFinishing ] = useState(false)
    const [ reveal, setReveal ] = useState(null)
    const toast = useToast()

    useEffect(() => {
        if (!sessionId) return

        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                const response = await getSession(sessionId)
                if (!cancelled) setSession(response.session)
            } catch (error) {
                if (!cancelled) toast?.error(getErrorMessage(error, "Couldn't load this practice session."))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ sessionId ])

    const currentQuestion = session?.turns?.find((turn) => typeof turn.overallScore !== "number") || null
    const answeredTurns = (session?.turns || []).filter((turn) => typeof turn.overallScore === "number")
    const isComplete = session?.status === "completed"

    const answer = useCallback(async (text) => {
        const trimmed = (text || "").trim()
        if (!trimmed || submitting) return false

        setSubmitting(true)
        try {
            const response = await submitAnswer(sessionId, trimmed)
            setSession(response.session)
            setReveal({
                scoredTurn: response.scoredTurn,
                nextQuestion: response.nextQuestion,
                completed: response.completed
            })
            return true
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't score that answer. Please try again."))
            return false
        } finally {
            setSubmitting(false)
        }
    }, [ sessionId, submitting, toast ])

    const continueToNext = useCallback(() => {
        setReveal(null)
    }, [])

    const finishEarly = useCallback(async () => {
        if (finishing) return
        setFinishing(true)
        try {
            const response = await completeSession(sessionId)
            setSession(response.session)
            setReveal(null)
            return true
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't wrap up the session. Please try again."))
            return false
        } finally {
            setFinishing(false)
        }
    }, [ sessionId, finishing, toast ])

    return {
        session,
        loading,
        submitting,
        finishing,
        reveal,
        currentQuestion,
        answeredCount: answeredTurns.length,
        isComplete,
        answer,
        continueToNext,
        finishEarly
    }
}
