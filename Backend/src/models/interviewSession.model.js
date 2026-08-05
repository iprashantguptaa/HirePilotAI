const mongoose = require("mongoose")

/**
 * Per-answer rubric. These five dimensions are scored independently for
 * every answer so the final report can show *which* aspect of a
 * candidate's answering is weak, not just an overall number.
 */
const answerRubricSchema = new mongoose.Schema({
    relevance: { type: Number, min: 0, max: 100 },
    depth: { type: Number, min: 0, max: 100 },
    structure: { type: Number, min: 0, max: 100 },
    clarity: { type: Number, min: 0, max: 100 },
    specificity: { type: Number, min: 0, max: 100 }
}, {
    _id: false
})

const answerFeedbackSchema = new mongoose.Schema({
    whatWorked: { type: String },
    whatWasMissing: { type: String },
    improvedAnswer: { type: String }
}, {
    _id: false
})

/**
 * A single question/answer exchange. Created unanswered when the question
 * is asked, then filled in when the candidate submits, so an abandoned
 * session still records which question they stalled on.
 */
const sessionTurnSchema = new mongoose.Schema({
    questionNumber: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [ "technical", "behavioral" ],
        required: true
    },
    // Follow-ups drill into the previous answer rather than opening a new
    // topic. Tracked so the report can show whether the candidate held up
    // under probing.
    isFollowUp: {
        type: Boolean,
        default: false
    },
    intention: { type: String },
    answer: { type: String },
    overallScore: { type: Number, min: 0, max: 100 },
    rubric: answerRubricSchema,
    feedback: answerFeedbackSchema,
    // "ai" = Gemini graded; "basic" = local heuristic when Gemini quota/busy.
    scoringMode: {
        type: String,
        enum: [ "ai", "basic" ],
        default: "ai"
    },
    askedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date }
}, {
    _id: false
})

const sessionReportSchema = new mongoose.Schema({
    overallScore: { type: Number, min: 0, max: 100 },
    rubricAverages: answerRubricSchema,
    verdict: { type: String },
    strengths: [ { type: String } ],
    weaknesses: [ { type: String } ],
    recommendations: [ { type: String } ]
}, {
    _id: false
})

const interviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    // Optional: a session can be started standalone, or from an existing
    // report so it inherits that role's resume/JD context.
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport"
    },
    title: {
        type: String,
        required: true
    },
    // Snapshotted at session creation so later edits to the source report
    // can't retroactively change what this session was graded against.
    jobDescription: { type: String },
    resume: { type: String },
    mode: {
        type: String,
        enum: [ "technical", "behavioral", "mixed" ],
        default: "mixed"
    },
    plannedQuestions: {
        type: Number,
        default: 6,
        min: 3,
        max: 15
    },
    status: {
        type: String,
        enum: [ "in_progress", "completed", "abandoned" ],
        default: "in_progress",
        index: true
    },
    turns: [ sessionTurnSchema ],
    report: sessionReportSchema,
    completedAt: { type: Date }
}, {
    timestamps: true
})

interviewSessionSchema.index({ user: 1, createdAt: -1 })

/**
 * Turns the candidate has actually answered. Scoring and completion logic
 * both key off this rather than `turns.length`, since the newest turn is
 * an unanswered pending question.
 */
interviewSessionSchema.virtual("answeredTurns").get(function () {
    return (this.turns || []).filter((turn) => typeof turn.overallScore === "number")
})

const interviewSessionModel = mongoose.model("InterviewSession", interviewSessionSchema)

module.exports = interviewSessionModel
