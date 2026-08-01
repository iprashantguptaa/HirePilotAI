function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function scoreBar(label, value) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0))
    return `
        <div class="score-row">
            <span class="score-row__label">${escapeHtml(label)}</span>
            <div class="score-row__track"><div class="score-row__fill" style="width:${safeValue}%"></div></div>
            <span class="score-row__value">${safeValue}%</span>
        </div>
    `
}

/**
 * Renders the full interview report (score, strengths, skill gaps,
 * questions, and prep plan) as a single printable HTML document.
 * Deliberately template-based rather than another AI call -- the data
 * already exists, so this is instant and free.
 */
function renderReportHtml(report) {
    const breakdown = report.scoreBreakdown || {}

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #17171a; margin: 0; padding: 0; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin: 24px 0 10px; border-bottom: 1px solid #e5e5ea; padding-bottom: 6px; }
            .subtitle { color: #55555f; font-size: 12px; margin-bottom: 20px; }
            .match-score { display: inline-block; font-size: 28px; font-weight: 700; color: #e1034d; }
            .score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; }
            .score-row__label { width: 120px; color: #55555f; }
            .score-row__track { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
            .score-row__fill { height: 100%; background: #e1034d; }
            .score-row__value { width: 36px; text-align: right; }
            .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin: 2px 4px 2px 0; }
            .pill--high { background: #fde2e2; color: #b91c1c; }
            .pill--medium { background: #fef3c7; color: #92400e; }
            .pill--low { background: #dbeafe; color: #1e40af; }
            .pill--strength { background: #dcfce7; color: #166534; }
            .qa { margin-bottom: 14px; page-break-inside: avoid; }
            .qa__q { font-weight: 600; font-size: 13px; margin-bottom: 3px; }
            .qa__meta { font-size: 11px; color: #55555f; margin-bottom: 3px; }
            .qa__a { font-size: 12px; line-height: 1.5; }
            .day { margin-bottom: 10px; }
            .day__title { font-weight: 600; font-size: 12px; }
            .day ul { margin: 4px 0 0; padding-left: 18px; font-size: 12px; }
        </style>
    </head>
    <body>
        <h1>${escapeHtml(report.title || "Interview Preparation Report")}</h1>
        <p class="subtitle">Generated ${new Date(report.createdAt || Date.now()).toLocaleDateString()}</p>

        <div class="match-score">${report.matchScore ?? "--"}%</div><span> overall match</span>

        <h2>Score Breakdown</h2>
        ${scoreBar("Technical skills", breakdown.technicalSkills)}
        ${scoreBar("Communication", breakdown.communication)}
        ${scoreBar("Experience", breakdown.experience)}
        ${scoreBar("Culture fit", breakdown.cultureFit)}

        <h2>Strengths</h2>
        ${(report.strengths || []).map((s) => `<span class="pill pill--strength">${escapeHtml(s.skill)}</span>`).join("") || "<p>No strengths recorded.</p>"}
        <ul>
            ${(report.strengths || []).map((s) => `<li style="font-size:12px;margin-top:6px;"><strong>${escapeHtml(s.skill)}:</strong> ${escapeHtml(s.note)}</li>`).join("")}
        </ul>

        <h2>Skill Gaps</h2>
        ${(report.skillGaps || []).map((g) => `<span class="pill pill--${g.severity}">${escapeHtml(g.skill)}</span>`).join("") || "<p>No skill gaps recorded.</p>"}

        <h2>Technical Questions</h2>
        ${(report.technicalQuestions || []).map((q, i) => `
            <div class="qa">
                <div class="qa__q">Q${i + 1}. ${escapeHtml(q.question)}</div>
                <div class="qa__meta">Why they ask this: ${escapeHtml(q.intention)}</div>
                <div class="qa__a">${escapeHtml(q.answer)}</div>
            </div>
        `).join("")}

        <h2>Behavioral Questions</h2>
        ${(report.behavioralQuestions || []).map((q, i) => `
            <div class="qa">
                <div class="qa__q">Q${i + 1}. ${escapeHtml(q.question)}</div>
                <div class="qa__meta">Why they ask this: ${escapeHtml(q.intention)}</div>
                <div class="qa__a">${escapeHtml(q.answer)}</div>
            </div>
        `).join("")}

        <h2>Preparation Roadmap</h2>
        ${(report.preparationPlan || []).map((day) => `
            <div class="day">
                <div class="day__title">Day ${day.day}: ${escapeHtml(day.focus)}</div>
                <ul>${(day.tasks || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
            </div>
        `).join("")}
    </body>
    </html>
    `
}

module.exports = { renderReportHtml }
