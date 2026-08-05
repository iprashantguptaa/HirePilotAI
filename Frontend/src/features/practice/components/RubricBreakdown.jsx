import { RUBRIC_DIMENSIONS, scoreTone } from "../practice.utils"

/**
 * The five rubric dimensions as labelled bars. Shown after every answer so
 * the candidate can see *which* aspect of their answering is weak, which is
 * the part that actually tells them what to practice.
 */
const RubricBreakdown = ({ rubric, showHints = false }) => {
    if (!rubric) return null

    return (
        <ul className="rubric">
            {RUBRIC_DIMENSIONS.map(({ key, label, hint }) => {
                const value = rubric[ key ]
                const hasValue = typeof value === "number"

                return (
                    <li key={key} className="rubric__row">
                        <div className="rubric__meta">
                            <span className="rubric__label">{label}</span>
                            <span className="rubric__value">{hasValue ? Math.round(value) : "--"}</span>
                        </div>
                        <div
                            className="rubric__track"
                            role="meter"
                            aria-label={label}
                            aria-valuenow={hasValue ? Math.round(value) : undefined}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className={`rubric__fill rubric__fill--${scoreTone(value)}`}
                                style={{ width: hasValue ? `${Math.max(Math.min(value, 100), 0)}%` : "0%" }}
                            />
                        </div>
                        {showHints && <p className="rubric__hint">{hint}</p>}
                    </li>
                )
            })}
        </ul>
    )
}

export default RubricBreakdown
