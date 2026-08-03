import { useState } from "react"
import { Link } from "react-router"
import { SEO } from "../../components/common"
import { useToast } from "../../components/ui/Toast/useToast"
import "./MarketingPage.scss"

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        badge: "Available now",
        amount: "₹0",
        period: "/month",
        description: "Full access while we build in the open. No card required.",
        features: [
            "Unlimited interview plans",
            "Resume analysis and match score",
            "Scored mock interviews",
            "Adaptive follow-up questions",
            "Preparation roadmap",
            "AI interview assistant",
            "PDF exports"
        ],
        cta: { type: "link", to: "/register", label: "Get started free" }
    },
    {
        id: "professional",
        name: "Professional",
        badge: "Coming Soon",
        badgeSoon: true,
        amount: "₹1,499",
        period: "/month",
        description: "For serious candidates who want voice practice and deeper analytics when it ships.",
        features: [
            "Everything in Starter",
            "Voice-based mock interviews",
            "Company-specific question banks",
            "Progress tracking across sessions",
            "Priority support"
        ],
        cta: { type: "notify", label: "Notify Me" }
    }
]

const PricingPage = () => {
    const [ selected, setSelected ] = useState("starter")
    const toast = useToast()

    const handleNotify = (event) => {
        event.stopPropagation()
        toast?.success("You're on the list. We'll email you when Professional launches.")
    }

    return (
        <>
            <SEO
                title="Pricing"
                description="HirePilot AI pricing in Indian Rupees. Start free. Professional plan coming soon."
            />

            <div className="pricing-page container">
                <header className="pricing-page__header">
                    <span className="marketing-page__eyebrow">Pricing</span>
                    <h1>Simple pricing in ₹</h1>
                    <p>Select a plan to preview it. Starter works today. Professional is Coming Soon — you can still select it and join the notify list.</p>
                </header>

                <div className="pricing-page__grid" role="listbox" aria-label="Pricing plans">
                    {PLANS.map((plan) => {
                        const isSelected = selected === plan.id

                        return (
                            <button
                                key={plan.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={[
                                    "plan-card",
                                    plan.id === "professional" ? "plan-card--pro" : "",
                                    isSelected ? "plan-card--selected" : ""
                                ].filter(Boolean).join(" ")}
                                onClick={() => setSelected(plan.id)}
                            >
                                <span className="plan-card__selected-mark" aria-hidden="true">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>

                                <span className={`plan-card__badge ${plan.badgeSoon ? "plan-card__badge--soon" : ""}`}>
                                    {plan.badge}
                                </span>

                                <h2 className="plan-card__name">{plan.name}</h2>

                                <div className="plan-card__price">
                                    <span className="plan-card__amount">{plan.amount}</span>
                                    <span className="plan-card__period">{plan.period}</span>
                                </div>

                                <p className="plan-card__description">{plan.description}</p>

                                <ul className="plan-card__features">
                                    {plan.features.map((feature) => (
                                        <li key={feature}><CheckIcon />{feature}</li>
                                    ))}
                                </ul>

                                <div className="plan-card__cta">
                                    {plan.cta.type === "link" ? (
                                        <Link
                                            to={plan.cta.to}
                                            className="button primary-button"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            {plan.cta.label}
                                        </Link>
                                    ) : (
                                        <span
                                            className="button secondary-button"
                                            role="button"
                                            tabIndex={0}
                                            onClick={handleNotify}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") handleNotify(event)
                                            }}
                                        >
                                            {plan.cta.label}
                                        </span>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <p className="pricing-page__note">
                    Selected plan: <strong>{selected === "starter" ? "Starter (₹0)" : "Professional (Coming Soon — ₹1,499/mo when available)"}</strong>.
                    Professional cannot be purchased yet.
                </p>
            </div>
        </>
    )
}

export default PricingPage
