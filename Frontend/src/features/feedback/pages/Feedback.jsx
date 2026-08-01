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
            <h1>Send <span className="highlight">Feedback</span></h1>
            <p className="profile-panel__muted">Tell us what's working, what's not, or what you'd like to see next.</p>

            {submitted ? (
                <div className="profile-panel">
                    <p>Thanks for the feedback! We read every submission.</p>
                    <button type="button" className="button secondary-button button-sm" onClick={() => setSubmitted(false)}>
                        Send another
                    </button>
                </div>
            ) : (
                <form className="profile-panel" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Category</span>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </label>

                    <label className="field">
                        <span>Message</span>
                        <textarea
                            rows={5} maxLength={2000} required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What's on your mind?"
                        />
                    </label>

                    <div className="feedback-rating">
                        <span>How's your experience so far? (optional)</span>
                        <div className="feedback-rating__stars">
                            {[ 1, 2, 3, 4, 5 ].map((n) => (
                                <button
                                    key={n} type="button"
                                    className={`feedback-rating__star ${n <= rating ? "feedback-rating__star--active" : ""}`}
                                    onClick={() => setRating(n === rating ? 0 : n)}
                                    aria-label={`${n} star`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="button primary-button" disabled={submitting || !message.trim()}>
                        {submitting ? "Sending..." : "Send feedback"}
                    </button>
                </form>
            )}
        </div>
    )
}

export default Feedback
