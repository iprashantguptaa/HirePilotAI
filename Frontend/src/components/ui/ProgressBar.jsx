import "./ProgressBar.scss"

/**
 * @param {{ label: string, value: number, max?: number }} props
 */
const ProgressBar = ({ label, value, max = 100 }) => {
    const safeValue = Math.max(0, Math.min(max, Number(value) || 0))
    const pct = (safeValue / max) * 100

    return (
        <div className="progress-bar">
            <div className="progress-bar__header">
                <span>{label}</span>
                <span>{safeValue}%</span>
            </div>
            <div className="progress-bar__track">
                <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

export default ProgressBar
