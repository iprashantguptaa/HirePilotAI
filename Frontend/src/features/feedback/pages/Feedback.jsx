import { useState } from "react"
import { submitFeedback } from "../services/feedback.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import "./feedback.scss"

const CATEGORIES = [
    { value: "idea", label: "Idea / suggestion" },
    { value: "bug", label: "Something's broken" },
    { value: "praise", label: "Just wanted to say thanks" },
    { value: "other", label: "Other" }
]

const Feedback = () => {
    const [ category, setCategory ] = useState("idea")
    const [ message, setMessage ] = useState("")
    const [ rating, setRating ] = useState(0)
    const [ submitting, setSubmitting ] = useState(false)
    const [ submitted, setSubmitted ] = useState(false)
    const toast = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        setSubmitting(true)
        try {
            await submitFeedback({ category, message: message.trim(), rating: rating || undefined })
            setSubmitted(true)
            setMessage("")
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't send feedback. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="feedback-page container">
            <header className="feedback-page__header">
                <div className="feedback-page__header-content">
                    <h1>Share Your <span className="text-gradient">Feedback</span></h1>
                    <p>Help us build a better product. Your insights drive our roadmap.</p>
                </div>
            </header>

            {submitted ? (
                <div className="feedback-success">
                    <div className="feedback-success__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h2>Thank you!</h2>
                    <p>We read every submission and truly appreciate your input.</p>
                    <button type="button" className="button primary-button" onClick={() => setSubmitted(false)}>
                        Send Another Feedback
                    </button>
                </div>
            ) : (
                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="feedback-form__field">
                        <label className="feedback-form__label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>
                            What's this about?
                        </label>
                        <div className="feedback-form__categories">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={`feedback-category ${category === c.value ? 'feedback-category--active' : ''}`}
                                    onClick={() => setCategory(c.value)}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="feedback-form__field">
                        <label className="feedback-form__label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Your Feedback
                        </label>
                        <textarea
                            rows={6}
                            maxLength={2000}
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What's on your mind? Share your thoughts, suggestions, or report issues..."
                            className="feedback-form__textarea"
                        />
                        <span className="feedback-form__hint">{message.length}/2000 characters</span>
                    </div>

                    <div className="feedback-form__field">
                        <label className="feedback-form__label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Rate Your Experience (Optional)
                        </label>
                        <div className="feedback-stars">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`feedback-star ${n <= rating ? 'feedback-star--active' : ''}`}
                                    onClick={() => setRating(n === rating ? 0 : n)}
                                    aria-label={`${n} star`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="feedback-form__footer">
                        <button type="submit" className="button primary-button button-lg" disabled={submitting || !message.trim()}>
                            {submitting ? (
                                <>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Send Feedback'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default Feedback
