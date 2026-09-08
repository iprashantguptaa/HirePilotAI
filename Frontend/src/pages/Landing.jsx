import { Link } from "react-router"
import { SEO } from "../components/common"
import { useAuth } from "../features/auth/hooks/useAuth.js"
import "./Landing.scss"

function ProductChrome({ title, children }) {
    return (
        <div className="hp-ui" aria-hidden="true">
            <div className="hp-ui__bar">
                <span className="hp-ui__mark" />
                <span>HirePilot</span>
                <span className="hp-ui__title">{title}</span>
            </div>
            <div className="hp-ui__body">{children}</div>
        </div>
    )
}

function ResumeMock() {
    const metrics = [
        [ "Resume score", "82" ],
        [ "ATS compatibility", "76" ],
        [ "Technical depth", "71" ],
        [ "Projects", "68" ],
        [ "Experience", "80" ],
        [ "Structure", "84" ],
        [ "Grammar", "91" ]
    ]

    return (
        <ProductChrome title="Resume analysis">
            <div className="hp-ui__grid">
                {metrics.map(([ label, value ]) => (
                    <div key={label} className="hp-ui__metric">
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <i style={{ width: `${value}%` }} />
                    </div>
                ))}
            </div>
            <div className="hp-ui__insight">
                <span>AI insight</span>
                <p>Target role alignment is strongest in implementation. System design and testing evidence are thin for the JD.</p>
            </div>
        </ProductChrome>
    )
}

function InterviewMock() {
    return (
        <ProductChrome title="Interview room">
            <p className="hp-ui__qmeta">AI interviewer · Question 04 / 10</p>
            <p className="hp-ui__question">“Tell me about a challenging technical problem you solved.”</p>
            <div className="hp-ui__rec"><span /> Typed answer</div>
            <ul className="hp-ui__progress">
                <li>Technical</li>
                <li>Behavioral</li>
                <li className="is-open">Communication</li>
                <li className="is-open">Problem solving</li>
                <li className="is-open">System design</li>
            </ul>
        </ProductChrome>
    )
}

function CareerMock() {
    return (
        <ProductChrome title="Career intelligence">
            <p className="hp-ui__role">Target role · MERN Developer</p>
            <div className="hp-ui__cols">
                <div>
                    <span>Strong areas</span>
                    <p>React</p>
                    <p>JavaScript</p>
                    <p>Node.js</p>
                </div>
                <div>
                    <span>Needs attention</span>
                    <p>System design</p>
                    <p>Docker</p>
                    <p>Testing</p>
                </div>
            </div>
            <div className="hp-ui__next">
                <span>Next best action</span>
                <strong>Improve system design</strong>
            </div>
            <div className="hp-ui__readiness">
                <span>Career readiness</span>
                <i />
            </div>
        </ProductChrome>
    )
}

const STEPS = [
    { n: "01", title: "Upload", kicker: "Bring your resume", text: "Upload your PDF resume (max 5MB) securely." },
    { n: "02", title: "Analyze", kicker: "Understand your profile", text: "AI identifies your skills, gaps and role alignment." },
    { n: "03", title: "Practice", kicker: "Prepare for the interview", text: "Get role-specific questions and practice with AI." },
    { n: "04", title: "Improve", kicker: "Turn feedback into progress", text: "Follow personalized recommendations and grow." }
]

const Landing = () => {
    const { user } = useAuth()
    const startHref = user ? "/interview/new" : "/register"

    return (
        <div className="lp">
            <SEO
                title="AI-Powered Career Intelligence"
                description="Analyze your resume, identify skill gaps, practice role-specific interviews, and build a clearer path toward your next opportunity."
            />

            <section className="lp-hero">
                <div className="lp-hero__copy">
                    <p className="lp-kicker">Navigate · Prepare · Grow</p>
                    <h1>Your career deserves an <em>AI copilot</em>.</h1>
                    <p className="lp-lead">
                        Analyze your resume, identify skill gaps, practice role-specific interviews, and build a clearer path toward your next opportunity.
                    </p>
                    <div className="lp-hero__actions">
                        <Link to={startHref} className="lp-btn lp-btn--primary">Analyze My Resume →</Link>
                        <a href="#how-it-works" className="lp-btn lp-btn--ghost">Explore HirePilot</a>
                    </div>
                    <p className="lp-trust">Secure · Private · Built for serious job seekers</p>
                </div>
                <ResumeMock />
            </section>

            <section className="lp-section lp-how" id="how-it-works">
                <header className="lp-section__head lp-section__head--center">
                    <h2>How HirePilot AI Works</h2>
                    <p>A simple, focused process to accelerate your career.</p>
                </header>
                <ol className="lp-steps">
                    {STEPS.map((step) => (
                        <li key={step.n}>
                            <span>{step.n}</span>
                            <h3>{step.title}</h3>
                            <p className="lp-steps__kicker">{step.kicker}</p>
                            <p>{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="lp-section lp-split" id="resume-intelligence">
                <div>
                    <p className="lp-eyebrow">Resume intelligence</p>
                    <h2>Know exactly where your resume stands.</h2>
                    <p className="lp-lead">
                        Every score comes with the reason behind it — which skills the job asks for, which ones your resume proves, and what to fix first.
                    </p>
                    <ul className="lp-points">
                        <li>ATS compatibility analysis</li>
                        <li>Skill extraction &amp; gap detection</li>
                        <li>Role-specific recommendations</li>
                        <li>Actionable improvement insights</li>
                    </ul>
                </div>
                <ProductChrome title="Skill gaps">
                    <ul className="hp-ui__gaps">
                        <li><span>System design</span><i className="is-high">High</i></li>
                        <li><span>Docker</span><i className="is-med">Medium</i></li>
                        <li><span>Testing</span><i className="is-med">Medium</i></li>
                        <li><span>Redis</span><i className="is-low">Low</i></li>
                        <li><span>AWS</span><i className="is-low">Low</i></li>
                    </ul>
                    <div className="hp-ui__insight">
                        <span>Fix first</span>
                        <p>Add one project that shows scale decisions and trade-offs — it closes the highest-severity gap for this role.</p>
                    </div>
                </ProductChrome>
            </section>

            <section className="lp-section lp-split lp-split--reverse" id="interview-intelligence">
                <InterviewMock />
                <div>
                    <p className="lp-eyebrow">AI interview practice</p>
                    <h2>Practice interviews that feel real.</h2>
                    <p className="lp-lead">
                        Get role-specific questions, intelligent follow-ups, and personalized feedback powered by AI.
                    </p>
                    <ul className="lp-points">
                        <li>Questions grounded in your resume and the job description</li>
                        <li>Role-specific and adaptive questioning</li>
                        <li>Detailed performance analysis</li>
                        <li>Personalized improvement roadmap</li>
                    </ul>
                </div>
            </section>

            <section className="lp-section lp-split" id="career-intelligence">
                <div>
                    <p className="lp-eyebrow">Career intelligence</p>
                    <h2>Know what to work on next.</h2>
                    <p className="lp-lead">
                        Turn your resume and interview performance into a clear, personalized path toward your target role.
                    </p>
                    <p className="lp-path">Resume → Skill gaps → Interview → Improvement → Career readiness</p>
                </div>
                <CareerMock />
            </section>

            <section className="lp-final" id="start">
                <h2>Your next opportunity deserves better preparation.</h2>
                <p>HirePilot gives you the insights, practice, and guidance you need to move forward with confidence.</p>
                <div className="lp-hero__actions">
                    <Link to={startHref} className="lp-btn lp-btn--primary">
                        {user ? "Start a new analysis →" : "Get started free →"}
                    </Link>
                    <Link to="/features" className="lp-btn lp-btn--ghost">Learn More</Link>
                </div>
            </section>

        </div>
    )
}

export default Landing
