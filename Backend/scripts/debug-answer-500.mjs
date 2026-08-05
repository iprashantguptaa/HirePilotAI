/**
 * Focused reproduction for the 500 seen on the second answer submission.
 *
 * Sends the long/detailed answer as answer #1. If it fails here, the cause is
 * the answer content or length. If it succeeds, the cause is specific to
 * submitting a second answer.
 */

const BASE = "http://localhost:3000"
let cookies = ""

function rememberCookies(response) {
    const set = response.headers.getSetCookie?.() || []
    if (set.length) {
        cookies = set.map((c) => c.split(";")[ 0 ]).join("; ")
    }
}

async function call(method, path, body) {
    const response = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...(cookies ? { Cookie: cookies } : {}) },
        body: body ? JSON.stringify(body) : undefined
    })
    rememberCookies(response)
    const text = await response.text()
    try {
        return { status: response.status, payload: JSON.parse(text) }
    } catch {
        return { status: response.status, payload: { raw: text.slice(0, 600) } }
    }
}

const DETAILED_ANSWER = `At my last role I owned the order-events pipeline that peaked
around 3.2 million events a day. The main problem when I joined was that our MongoDB
writes were the bottleneck -- p99 write latency was about 1.4 seconds because every
event did an upsert against a collection with only a single-field index on orderId.
I profiled it with the Mongo profiler, found the upserts were doing collection scans
on a secondary lookup by merchantId plus status, and added a compound index on
{merchantId: 1, status: 1, createdAt: -1}. That took p99 down to roughly 90ms.
I also moved the pipeline from direct writes to batched bulkWrite calls of 500
documents behind an SQS queue, which cut our connection count from about 400 to 40.
For observability I added OpenTelemetry traces and a dashboard alerting on consumer
lag, which is how we caught a poison-message loop two weeks later before customers
noticed. I mentored one mid-level engineer through the indexing work by pairing on
the explain() output rather than just handing over the fix.`

const stamp = Date.now()
await call("POST", "/api/auth/register", {
    username: `dbg_${stamp}`,
    email: `dbg_${stamp}@example.com`,
    password: "ProbePassw0rd!23"
})

const started = await call("POST", "/api/session", {
    jobDescription: "Senior Backend Engineer, Node.js, MongoDB, high-throughput payments ingestion at ~4M events/day. Requires deep Node, Mongo indexing, Kafka/SQS, observability and incident debugging.",
    title: "Senior Backend Engineer",
    mode: "technical",
    plannedQuestions: 3
})
console.log("start status:", started.status)
console.log("Q1:", started.payload.session?.turns?.[ 0 ]?.question, "\n")

console.log(`Submitting the DETAILED answer as answer #1 (${DETAILED_ANSWER.length} chars)...`)
const first = await call("POST", `/api/session/${started.payload.session._id}/answer`, { answer: DETAILED_ANSWER })
console.log("status:", first.status)

if (first.status === 200) {
    console.log("score:", first.payload.scoredTurn?.overallScore)
    console.log("rubric:", JSON.stringify(first.payload.scoredTurn?.rubric))
    console.log("\n=> Long answer is FINE as #1. The failure is specific to the SECOND submission.")

    console.log("\nSubmitting a second answer...")
    const second = await call("POST", `/api/session/${started.payload.session._id}/answer`, { answer: DETAILED_ANSWER })
    console.log("status:", second.status)
    console.log("message:", second.payload?.message)
    if (second.payload?.stack) {
        console.log("\n--- STACK ---")
        console.log(second.payload.stack.split("\n").slice(0, 14).join("\n"))
    }
} else {
    console.log("message:", first.payload?.message)
    if (first.payload?.stack) {
        console.log("\n--- STACK ---")
        console.log(first.payload.stack.split("\n").slice(0, 14).join("\n"))
    }
    console.log("\n=> The long answer itself fails. Cause is answer content/length.")
}
