export const RUBRIC_DIMENSIONS = [
    { key: "relevance", label: "Relevance", hint: "Did you answer the question that was actually asked?" },
    { key: "depth", label: "Depth", hint: "Substance and correctness of your reasoning" },
    { key: "structure", label: "Structure", hint: "How clearly the answer was organised" },
    { key: "clarity", label: "Clarity", hint: "Concise communication, free of rambling" },
    { key: "specificity", label: "Specificity", hint: "Concrete examples and real numbers, not generalities" }
]

/**
 * Maps a 0-100 score onto the three-band scale the practice styles use.
 * Thresholds match the scoring prompt's guidance that an unremarkable
 * answer lands in the 50s, so "mid" reads as "passable, needs work".
 */
export function scoreTone(score) {
    if (typeof score !== "number") return "none"
    if (score >= 75) return "high"
    if (score >= 55) return "mid"
    return "low"
}

export function scoreLabel(score) {
    const tone = scoreTone(score)
    if (tone === "high") return "Strong"
    if (tone === "mid") return "Needs work"
    if (tone === "low") return "Weak"
    return "Not scored"
}

export const PRACTICE_MODES = [
    { value: "mixed", label: "Mixed", description: "Technical and behavioural questions blended, like a real screen" },
    { value: "technical", label: "Technical", description: "Domain and problem-solving questions only" },
    { value: "behavioral", label: "Behavioural", description: "Situational and motivational questions only" }
]

export const QUESTION_COUNTS = [ 3, 6, 10 ]
