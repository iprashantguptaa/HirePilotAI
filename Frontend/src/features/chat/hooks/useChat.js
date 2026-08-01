import { useCallback, useEffect, useState } from "react"
import { getConversation, sendChatMessage } from "../services/chat.api"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
}

export function useChat(interviewId) {
    const [ messages, setMessages ] = useState([])
    const [ loadingHistory, setLoadingHistory ] = useState(true)
    const [ sending, setSending ] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (!interviewId) return

        let cancelled = false

        async function loadHistory() {
            setLoadingHistory(true)
            try {
                const response = await getConversation(interviewId)
                if (!cancelled) setMessages(response.conversation?.messages || [])
            } catch (error) {
                if (!cancelled) toast?.error(getErrorMessage(error, "Couldn't load the assistant conversation."))
            } finally {
                if (!cancelled) setLoadingHistory(false)
            }
        }

        loadHistory()

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ interviewId ])

    const sendMessage = useCallback(async (text) => {
        const trimmed = text.trim()
        if (!trimmed || sending) return

        setSending(true)
        setMessages((current) => [ ...current, { role: "user", content: trimmed } ])

        try {
            const response = await sendChatMessage(interviewId, trimmed)
            setMessages((current) => [ ...current, { role: "assistant", content: response.reply } ])
        } catch (error) {
            toast?.error(getErrorMessage(error, "The assistant couldn't respond. Please try again."))
            // Roll back the optimistic user message since it was never
            // actually saved server-side.
            setMessages((current) => current.slice(0, -1))
        } finally {
            setSending(false)
        }
    }, [ interviewId, sending, toast ])

    return { messages, loadingHistory, sending, sendMessage }
}
