/**
 * End-to-end check of the live practice interview flow against a running
 * server. Exercises the real Gemini calls, so it consumes tokens and takes
 * a minute or so.
 *
 * Beyond checking the happy path, this asserts the scorer actually
 * discriminates: a deliberately vague answer must score lower than a
 * detailed one. A scorer that hands out 85/100 regardless would make the
 * whole feature worthless while still "passing" a smoke test.
 *
 * Usage: node scripts/verify-practice-flow.mjs [baseUrl]
 */

const BASE = process.argv[ 2 ] || "http://localhost:3000"

let cookies = ""

function rememberCookies(response) {
    const set = response.headers.getSetCookie?.() || []
    if (!set.length) return

    const jar = new Map(
        cookies
            .split("; ")
            .filter(Boolean)
            .map((pair) => [ pair.split("=")[ 0 ], pair ])
    )

    for (const raw of set) {
        const pair = raw.split(";")[ 0 ]
        jar.set(pair.split("=")[ 0 ], pair)
    }

    cookies = [ ...jar.values() ].join("; ")
}

let quotaExhausted = false

async function call(method, path, body) {
    const response = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(cookies ? { Cookie: cookies } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    })

    rememberCookies(response)

    const text = await response.text()
    let payload
    try {
        payload = JSON.parse(text)
    } catch {
        payload = { raw: text.slice(0, 400) }
    }

    if (/reached its usage limit/i.test(payload?.message || "")) {
        quotaExhausted = true
    }

    return { status: response.status, payload }
}

/**
 * The AI provider intermittently returns 503 under load. The service layer
 * already retries with backoff; this adds one more layer so a genuine provider
 * outage doesn't read as a logic failure in this test.
 */
async function callWithRetry(method, path, body, attempts = 4) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const result = await call(method, path, body)
        if (result.status !== 503) return result

        if (attempt < attempts) {
            const wait = 4000 * attempt
            console.log(`    (provider busy, waiting ${wait}ms and retrying ${attempt}/${attempts - 1})`)
            await new Promise((resolve) => setTimeout(resolve, wait))
        }
    }
    return call(method, path, body)
}

const results = []
function check(label, condition, detail = "") {
    results.push({ label, ok: Boolean(condition), detail })
    console.log(`  ${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` -- ${detail}` : ""}`)
    return Boolean(condition)
}

const JOB_DESCRIPTION = `Senior Backend Engineer, Node.js.
We need someone who has run production Node services at scale. You will own our
payments ingestion pipeline, which handles roughly 4 million events per day.
Requirements: deep Node.js and Express, MongoDB schema design and indexing,
message queues (Kafka or SQS), observability, and experience debugging
production incidents. You will mentor two mid-level engineers.`

const VAGUE_ANSWER = `I have worked with Node.js for a while and I am very passionate
about backend development. I am a fast learner and a good team player. I have used
databases before and I know how to write APIs. I always try my best and I work hard
to deliver good quality code on time.`

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

async function main() {
    console.log(`Verifying practice flow against ${BASE}\n`)

    // ---- Health -----------------------------------------------------------
    console.log("Health")
    const health = await call("GET", "/api/health")
    if (!check("server is reachable", health.status === 200, `status ${health.status}`)) {
        console.error("\nServer not reachable -- start it with `npm start` in Backend/.")
        process.exit(1)
    }

    // ---- Auth -------------------------------------------------------------
    console.log("\nAuth")
    const stamp = Date.now()
    const credentials = {
        username: `practice_probe_${stamp}`,
        email: `practice_probe_${stamp}@example.com`,
        password: "ProbePassw0rd!23"
    }

    const registered = await call("POST", "/api/auth/register", credentials)
    check("registered a test user", registered.status === 201 || registered.status === 200,
        `status ${registered.status} ${registered.payload?.message || ""}`)
    check("auth cookies were set", cookies.includes("accessToken"), cookies ? "cookie jar populated" : "no cookies")

    if (!cookies) {
        console.error("\nCould not authenticate -- aborting.")
        process.exit(1)
    }

    // ---- Start session ----------------------------------------------------
    console.log("\nStart session")
    const started = await callWithRetry("POST", "/api/session", {
        jobDescription: JOB_DESCRIPTION,
        title: "Senior Backend Engineer",
        mode: "technical",
        plannedQuestions: 3
    })

    if (!check("session created", started.status === 201, `status ${started.status} ${started.payload?.message || ""}`)) {
        console.error(JSON.stringify(started.payload, null, 2).slice(0, 1000))
        process.exit(1)
    }

    const sessionId = started.payload.session?._id
    const firstQuestion = started.payload.session?.turns?.[ 0 ]

    check("session has an id", Boolean(sessionId), sessionId)
    check("first question was generated", Boolean(firstQuestion?.question))
    check("first question is not a follow-up", firstQuestion?.isFollowUp === false)
    check("first question has no score yet", firstQuestion?.overallScore === undefined)
    check("question is grounded in the role",
        /node|mongo|queue|kafka|sqs|scale|production|pipeline|index/i.test(firstQuestion?.question || ""),
        `"${(firstQuestion?.question || "").slice(0, 110)}..."`)

    // ---- Answer 1: deliberately vague ------------------------------------
    console.log("\nAnswer 1 (deliberately vague)")
    const vague = await callWithRetry("POST", `/api/session/${sessionId}/answer`, { answer: VAGUE_ANSWER })

    if (!check("vague answer accepted and scored", vague.status === 200, `status ${vague.status} ${vague.payload?.message || ""}`)) {
        console.error(JSON.stringify(vague.payload, null, 2).slice(0, 1000))
        process.exit(1)
    }

    const vagueTurn = vague.payload.scoredTurn
    const vagueScore = vagueTurn?.overallScore

    check("vague answer has an overall score", typeof vagueScore === "number", `${vagueScore}/100`)
    check("all five rubric dimensions scored",
        [ "relevance", "depth", "structure", "clarity", "specificity" ]
            .every((k) => typeof vagueTurn?.rubric?.[ k ] === "number"),
        JSON.stringify(vagueTurn?.rubric))
    check("feedback names what was missing", Boolean(vagueTurn?.feedback?.whatWasMissing?.length > 20))
    check("feedback offers a stronger answer", Boolean(vagueTurn?.feedback?.improvedAnswer?.length > 40))
    check("vague answer was NOT grade-inflated", vagueScore < 60, `scored ${vagueScore}/100, expected < 60`)
    check("a next question was returned", Boolean(vague.payload.nextQuestion?.question))
    check("session not yet complete", vague.payload.completed === false)

    // ---- Answer 2: detailed ---------------------------------------------
    console.log("\nAnswer 2 (detailed, with specifics)")
    const detailed = await callWithRetry("POST", `/api/session/${sessionId}/answer`, { answer: DETAILED_ANSWER })
    check("detailed answer scored", detailed.status === 200, `status ${detailed.status}`)

    const detailedScore = detailed.payload.scoredTurn?.overallScore
    check("detailed answer has a score", typeof detailedScore === "number", `${detailedScore}/100`)
    check("scorer discriminates: detailed > vague",
        detailedScore > vagueScore,
        `detailed ${detailedScore} vs vague ${vagueScore}`)
    check("specificity rewarded on the detailed answer",
        detailed.payload.scoredTurn?.rubric?.specificity > vagueTurn?.rubric?.specificity,
        `specificity ${detailed.payload.scoredTurn?.rubric?.specificity} vs ${vagueTurn?.rubric?.specificity}`)

    // ---- Answer 3: completes the session --------------------------------
    console.log("\nAnswer 3 (final, should complete the session)")
    const final = await callWithRetry("POST", `/api/session/${sessionId}/answer`, { answer: DETAILED_ANSWER })
    check("final answer scored", final.status === 200, `status ${final.status}`)
    check("session reported complete", final.payload.completed === true)
    check("no next question after completion", final.payload.nextQuestion === null)

    const report = final.payload.session?.report
    check("report was generated", Boolean(report))
    check("report has an overall score", typeof report?.overallScore === "number", `${report?.overallScore}/100`)
    check("report has rubric averages",
        typeof report?.rubricAverages?.depth === "number",
        JSON.stringify(report?.rubricAverages))
    check("session status is completed", final.payload.session?.status === "completed")

    // The narrative is generated by a separate AI call that degrades gracefully.
    // If it was lost, re-fetching should self-heal it via the backfill path.
    let narrative = report
    if (!report?.verdict) {
        console.log("    (narrative missing on completion -- re-fetching to exercise the backfill)")
        const refetched = await call("GET", `/api/session/${sessionId}`)
        narrative = refetched.payload.session?.report
        check("narrative backfilled on re-fetch", Boolean(narrative?.verdict),
            narrative?.verdict ? "recovered" : "still missing (AI quota/outage)")
    }

    check("report has a verdict", Boolean(narrative?.verdict?.length > 20))
    check("report lists weaknesses", Array.isArray(narrative?.weaknesses) && narrative.weaknesses.length > 0)
    check("report lists recommendations", Array.isArray(narrative?.recommendations) && narrative.recommendations.length > 0)

    // Overall score must reconcile with the individual answer scores, since it
    // is computed locally rather than asked of the model.
    const turns = final.payload.session?.turns || []
    const expectedAverage = Math.round(
        turns.reduce((sum, turn) => sum + turn.overallScore, 0) / turns.length
    )
    check("overall score is the mean of answer scores",
        report?.overallScore === expectedAverage,
        `report ${report?.overallScore} vs computed ${expectedAverage} from [${turns.map((t) => t.overallScore).join(", ")}]`)

    // ---- Persistence + ownership ----------------------------------------
    console.log("\nPersistence")
    const fetched = await call("GET", `/api/session/${sessionId}`)
    check("session can be re-fetched", fetched.status === 200)
    check("transcript persisted", fetched.payload.session?.turns?.length === 3,
        `${fetched.payload.session?.turns?.length} turns`)
    check("every persisted turn has an answer",
        (fetched.payload.session?.turns || []).every((t) => Boolean(t.answer)))

    const listed = await call("GET", "/api/session")
    check("session appears in the list", listed.payload.sessions?.some((s) => s._id === sessionId))

    const rejected = await callWithRetry("POST", `/api/session/${sessionId}/answer`, { answer: "too late" })
    check("completed session rejects new answers", rejected.status === 400, `status ${rejected.status}`)

    const emptyAnswer = await callWithRetry("POST", "/api/session", { jobDescription: "x" })
    check("short/invalid job description still creates or rejects cleanly",
        emptyAnswer.status === 201 || emptyAnswer.status === 400,
        `status ${emptyAnswer.status}`)

    // ---- Ownership isolation --------------------------------------------
    const ownerCookies = cookies
    cookies = ""
    const otherStamp = Date.now() + 1
    await call("POST", "/api/auth/register", {
        username: `practice_other_${otherStamp}`,
        email: `practice_other_${otherStamp}@example.com`,
        password: "ProbePassw0rd!23"
    })
    const leak = await call("GET", `/api/session/${sessionId}`)
    check("another user cannot read the session", leak.status === 404, `status ${leak.status}`)
    cookies = ownerCookies

    // ---- Summary ---------------------------------------------------------
    const failed = results.filter((r) => !r.ok)
    console.log(`\n${"=".repeat(60)}`)
    console.log(`${results.length - failed.length}/${results.length} checks passed`)

    if (failed.length) {
        console.log("\nFailures:")
        failed.forEach((f) => console.log(`  - ${f.label}${f.detail ? ` (${f.detail})` : ""}`))

        if (quotaExhausted) {
            console.log("\nNOTE: the AI provider reported quota exhaustion during this run")
            console.log("(\"exceeded your current quota\"). Failures above that depend on an AI")
            console.log("call are environmental, not logic errors. Check the Gemini API key's")
            console.log("plan/billing and re-run.")
        }

        process.exit(1)
    }

    console.log("Practice flow verified end to end.")
}

main().catch((error) => {
    console.error("\nUnexpected error:", error)
    process.exit(1)
})
