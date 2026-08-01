const Sparkline = ({ values, width = 280, height = 64 }) => {
    if (!values || values.length < 2) return null

    const max = Math.max(...values, 100)
    const min = Math.min(...values, 0)
    const range = max - min || 1

    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * width
            const y = height - ((value - min) / range) * height
            return `${x},${y}`
        })
        .join(" ")

    return (
        <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default Sparkline
