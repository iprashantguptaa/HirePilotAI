const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 }

export function computeSummary(reports) {
    if (!reports || reports.length === 0) {
        return { total: 0, averageScore: null, bestScore: null, latestDate: null }
    }

    const scores = reports.map((r) => r.matchScore).filter((score) => typeof score === "number")
    const averageScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null
    const bestScore = scores.length ? Math.max(...scores) : null
    const latestDate = reports[ 0 ]?.createdAt || null

    return { total: reports.length, averageScore, bestScore, latestDate }
}

/**
 * Aggregates skillGaps across all reports into a ranked list, so the
 * dashboard can show real recurring weak areas instead of a single
 * report's snapshot.
 */
export function computeTopSkillGaps(reports, limit = 6) {
    const bySkill = new Map()

    for (const report of reports || []) {
        for (const gap of report.skillGaps || []) {
            if (!gap?.skill) continue

            const existing = bySkill.get(gap.skill) || { skill: gap.skill, count: 0, maxSeverity: "low" }
            existing.count += 1

            if ((SEVERITY_WEIGHT[ gap.severity ] || 0) > (SEVERITY_WEIGHT[ existing.maxSeverity ] || 0)) {
                existing.maxSeverity = gap.severity
            }

            bySkill.set(gap.skill, existing)
        }
    }

    return Array.from(bySkill.values())
        .sort((a, b) => (SEVERITY_WEIGHT[ b.maxSeverity ] - SEVERITY_WEIGHT[ a.maxSeverity ]) || (b.count - a.count))
        .slice(0, limit)
}

/**
 * Returns scores oldest-first, suitable for a trend sparkline.
 */
export function computeScoreTrend(reports) {
    return [ ...(reports || []) ]
        .filter((r) => typeof r.matchScore === "number")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((r) => r.matchScore)
}
