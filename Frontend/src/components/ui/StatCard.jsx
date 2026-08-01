import "./StatCard.scss"

/**
 * @param {{ label: string, value: React.ReactNode, hint?: string, icon?: React.ReactNode }} props
 */
const StatCard = ({ label, value, hint, icon }) => {
    return (
        <div className="stat-card">
            {icon && <div className="stat-card__icon">{icon}</div>}
            <div className="stat-card__body">
                <p className="stat-card__label">{label}</p>
                <p className="stat-card__value">{value}</p>
                {hint && <p className="stat-card__hint">{hint}</p>}
            </div>
        </div>
    )
}

export default StatCard
