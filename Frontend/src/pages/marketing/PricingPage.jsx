import { Link } from "react-router"
import { SEO } from "../../components/common"
import { useToast } from "../../components/ui/Toast/useToast"
import "./MarketingPage.scss"

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const STARTER_FEATURES = [
    "Unlimited interview plans",
    "Resume analysis and match score",
    "Text mock interviews with every answer scored",
    "Adaptive follow-up questions",
    "Preparation roadmap",
    "AI interview assistant",
    "PDF exports"
]

const COMING_SOON_FEATURES = [
    "Camera-based mock interviews (expression, gesture, posture, confidence)",
    "Voice answers with spoken feedback",
    "Company-specific question banks",
    "Deeper progress tracking across sessions"
]

const PricingPage = () => {
    const toast = useToast()

    return (
        <>
            <SEO
                title="Pricing"
                description="HirePilot AI pricing in Indian Rupees. Starter is free today. Advanced interview modes are Coming Soon."
            />

            <div className="pricing-page container">
                <header className="pricing-page__header">
                    <span className="marketing-page__eyebrow">Pricing</span>
                    <h1>Simple pricing in ₹</h1>
                    <p>
                        Starter is available now. Future camera and voice interview modes are listed as Coming Soon —
                        they are not selectable or purchasable yet.
                    </p>
                </header>

                <div className="pricing-page__grid">
                    <div className="plan-card plan-card--selected" aria-current="true">
                        <span className="plan-card__badge">Available now</span>
                        <h2 className="plan-card__name">Starter</h2>
                        <div className="plan-card__price">
                            <span className="plan-card__amount">₹0</span>
                            <span className="plan-card__period">/month</span>
                        </div>
                        <p className="plan-card__description">
                            Everything that works today. No card. No trial timer.
                        </p>
                        <ul className="plan-card__features">
                            {STARTER_FEATURES.map((feature) => (
                                <li key={feature}><CheckIcon />{feature}</li>
                            ))}
                        </ul>
                        <div className="plan-card__cta">
                            <Link to="/register" className="button primary-button">Get started free</Link>
                        </div>
                    </div>

                    <div className="plan-card plan-card--pro plan-card--disabled" aria-disabled="true">
                        <span className="plan-card__badge plan-card__badge--soon">Coming Soon</span>
                        <h2 className="plan-card__name">Professional</h2>
                        <div className="plan-card__price">
                            <span className="plan-card__amount">₹1,499</span>
                            <span className="plan-card__period">/month</span>
                        </div>
                        <p className="plan-card__description">
                            Planned later — including AI mock interviews that read answers on screen and analyze facial expression, gesture, posture and confidence. Not available to buy or select yet.
                        </p>
                        <ul className="plan-card__features">
                            {COMING_SOON_FEATURES.map((feature) => (
                                <li key={feature}><CheckIcon />{feature}</li>
                            ))}
                        </ul>
                        <div className="plan-card__cta">
                            <button
                                type="button"
                                className="button secondary-button"
                                onClick={() => toast?.success("Noted. We'll announce Professional when camera/voice interviews ship.")}
                            >
                                Notify Me
                            </button>
                        </div>
                    </div>
                </div>

                <p className="pricing-page__note">
                    Coming Soon cards are informational only. You cannot select or purchase them until those features ship.
                </p>
            </div>
        </>
    )
}

export default PricingPage
