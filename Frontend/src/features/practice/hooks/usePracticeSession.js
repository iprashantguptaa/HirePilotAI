import { useCallback, useEffect, useState } from "react"
import { getSession, submitAnswer, completeSession } from "../services/practice.api"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
}

function findOpenQuestion(session) {
    return session?.turns?.find((turn) => typeof turn.overallScore !== "number") || null
}

/**
 * Drives a live practice interview.
 *
 * The session advances in two beats rather than one: submitting an answer
 * reveals that answer's score and feedback, and the candidate then explicitly
 * moves on to the next question. Auto-advancing would mean the feedback -- the
 * whole point of practicing -- flashes past unread.
 */
export function usePracticeSession(sessionId) {
    const [ session, setSession ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ submitting, setSubmitting ] = useState(false)
    const [ finishing, setFinishing ] = useState(false)
    const [ advancing, setAdvancing ] = useState(false)
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

    const currentQuestion = findOpenQuestion(session)
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
                completed: Boolean(response.completed),
                needsNextQuestion: Boolean(response.needsNextQuestion)
            })
            return true
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't score that answer. Please try again."))
            // Score may already be saved server-side; refresh so the UI can heal.
            try {
                const refreshed = await getSession(sessionId)
                setSession(refreshed.session)
            } catch {
                // keep prior session state
            }
            return false
        } finally {
            setSubmitting(false)
        }
    }, [ sessionId, submitting, toast ])

    const continueToNext = useCallback(async () => {
        const wasComplete = Boolean(reveal?.completed)
        setReveal(null)

        if (wasComplete) return true

        // If the next question wasn't generated with the score response,
        // GET /session self-heals by appending one.
        if (session?.status === "in_progress" && !findOpenQuestion(session)) {
            setAdvancing(true)
            try {
                const response = await getSession(sessionId)
                setSession(response.session)
                if (!findOpenQuestion(response.session) && response.session.status === "in_progress") {
                    toast?.error("Couldn't load the next question yet. Please try again in a few seconds.")
                    return false
                }
                return true
            } catch (error) {
                toast?.error(getErrorMessage(error, "Couldn't load the next question. Please try again."))
                return false
            } finally {
                setAdvancing(false)
            }
        }

        return true
    }, [ reveal, session, sessionId, toast ])

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
        advancing,
        reveal,
        currentQuestion,
        answeredCount: answeredTurns.length,
        isComplete,
        answer,
        continueToNext,
        finishEarly
    }
}
