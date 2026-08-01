import { useEffect, useRef, useState } from "react"
import { useChat } from "../hooks/useChat"
import "./ChatPanel.scss"

const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

const TypingIndicator = () => (
    <div className="chat-message chat-message--assistant chat-message--typing">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
    </div>
)

const ChatPanel = ({ interviewId }) => {
    const { messages, loadingHistory, sending, sendMessage } = useChat(interviewId)
    const [ draft, setDraft ] = useState("")
    const scrollRef = useRef(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [ messages, sending ])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!draft.trim() || sending) return
        sendMessage(draft)
        setDraft("")
    }

    return (
        <div className="chat-panel">
            <div className="chat-panel__intro">
                <h3>AI Interview Assistant</h3>
                <p>Practice answering questions out loud with an AI interviewer that knows your resume and this job description.</p>
            </div>

            <div className="chat-panel__messages" ref={scrollRef}>
                {loadingHistory ? (
                    <p className="chat-panel__muted">Loading conversation...</p>
                ) : messages.length === 0 ? (
                    <p className="chat-panel__muted">Say hello to start a mock interview for this role.</p>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`chat-message chat-message--${msg.role}`}>
                            {msg.content}
                        </div>
                    ))
                )}
                {sending && <TypingIndicator />}
            </div>

            <form className="chat-panel__composer" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your answer or ask a question..."
                    maxLength={2000}
                    disabled={sending}
                />
                <button type="submit" className="button primary-button button-sm" disabled={sending || !draft.trim()} aria-label="Send message">
                    <SendIcon />
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
