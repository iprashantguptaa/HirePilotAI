/**
 * Derive 3 concrete next actions from an existing interview report.
 * No extra AI call — fast, free, deterministic.
 */

const DIMENSION_META = [
    { key: "technicalSkills", label: "Technical skills", section: "technical" },
    { key: "communication", label: "Communication", section: "behavioral" },
    { key: "experience", label: "Experience", section: "roadmap" },
    { key: "cultureFit", label: "Culture fit", section: "behavioral" }
]

export const SEVERITY_RANK = { high: 3, critical: 3, medium: 2, important: 2, low: 1 }

export function buildPriorityActions(report) {
    if (!report) return []

    const actions = []
    const breakdown = report.scoreBreakdown || {}
    const gaps = [ ...(report.skillGaps || []) ].sort(
        (a, b) => (SEVERITY_RANK[ b.severity ] || 0) - (SEVERITY_RANK[ a.severity ] || 0)
    )

    const weakest = DIMENSION_META
        .map((dim) => ({ ...dim, value: Number(breakdown[ dim.key ]) }))
        .filter((dim) => Number.isFinite(dim.value))
        .sort((a, b) => a.value - b.value)

    if (weakest[ 0 ] && weakest[ 0 ].value < 80) {
        const dim = weakest[ 0 ]
        actions.push({
            id: `dim-${dim.key}`,
            title: `Raise ${dim.label} (${dim.value}%)`,
            detail: dim.section === "roadmap"
                ? "Work the roadmap tasks that rebuild depth for this role."
                : `Practice ${dim.section} questions and aim for specific examples with numbers.`,
            cta: dim.section === "roadmap" ? "Open roadmap" : "Practice now",
            target: dim.section === "roadmap" ? "roadmap" : "practice",
            focus: dim.section === "roadmap" ? null : dim.section,
            gapSkill: null
        })
    }

    if (gaps[ 0 ]?.skill) {
        actions.push({
            id: `gap-${gaps[ 0 ].skill}`,
            title: `Close gap: ${gaps[ 0 ].skill}`,
            detail: "Open related questions for this gap, then practice answers that prove progress.",
            cta: "See related questions",
            target: "gap",
            focus: "technical",
            gapSkill: gaps[ 0 ].skill
        })
    }

    const techCount = report.technicalQuestions?.length || 0
    const behCount = report.behavioralQuestions?.length || 0
    if (techCount + behCount > 0) {
        actions.push({
            id: "practice-set",
            title: "Run a 3-question scored set",
            detail: "One short practice loop beats reading every model answer passively.",
            cta: "Start practice",
            target: "practice",
            focus: "mixed",
            gapSkill: null
        })
    }

    const seen = new Set()
    return actions.filter((action) => {
        if (seen.has(action.id)) return false
        seen.add(action.id)
        return true
    }).slice(0, 3)
}

// Without this, a gap like "System Design for Scale" contributes the token
// "for", which appears in nearly every question and matches the whole bank.
const STOPWORDS = new Set([
    "a", "an", "and", "at", "by", "for", "from", "in", "into", "of", "on", "or",
    "per", "the", "to", "via", "with", "your", "you", "advanced", "basic"
])

// Short tech names that must survive the length filter.
const SHORT_ALLOW = new Set([ "go", "js", "ts", "ci", "cd", "qa", "ml", "ai", "db" ])

function gapTokens(gapSkill) {
    const raw = String(gapSkill || "").toLowerCase().trim()
    const words = raw.split(/[^a-z0-9+#]+/).filter(Boolean)
    const tokens = new Set()

    for (const word of words) {
        if (STOPWORDS.has(word)) continue
        if (word.length >= 3 || SHORT_ALLOW.has(word)) tokens.add(word)
    }

    // Keep the full phrase so "system design" can match as a unit.
    if (raw.length >= 3) tokens.add(raw)
    return [ ...tokens ]
}

/**
 * Filter questions that loosely relate to a skill gap string.
 * Short skills (SQL, AWS, Go) are included so clicks are not empty by accident.
 */
export function filterQuestionsByGap(questions, gapSkill) {
    if (!gapSkill) return questions || []
    const tokens = gapTokens(gapSkill)
    if (!tokens.length) return questions || []

    const scored = (questions || []).map((q, index) => {
        const hay = `${q.question || ""} ${q.intention || ""} ${q.answer || ""}`.toLowerCase()
        const hits = tokens.filter((t) => hay.includes(t)).length
        return { q, index, hits }
    })

    const matched = scored.filter((row) => row.hits > 0).sort((a, b) => b.hits - a.hits)
    if (!matched.length) return []
    return matched.map((row) => ({ ...row.q, _sourceIndex: row.index }))
}

export function findTodaysRoadmapFocus(plan, checkedTasks = {}) {
    for (const day of plan || []) {
        const tasks = day.tasks || []
        const incomplete = tasks.findIndex((_, i) => !checkedTasks[ `${day.day}-${i}` ])
        if (incomplete >= 0) {
            return { day: day.day, focus: day.focus, task: tasks[ incomplete ] }
        }
    }
    return null
}
