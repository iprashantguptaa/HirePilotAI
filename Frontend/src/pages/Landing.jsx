import { Link, useNavigate } from "react-router"
import { useState, useEffect } from "react"
import { SEO } from "../components/common"
import { useToast } from "../components/ui/Toast/useToast"
import { Textarea, FileUpload, Button, Alert } from "../components/ui"
import "./Landing.scss"
import "../pages/marketing/MarketingPage.scss"

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

const STARTER_FEATURES = [
    "Unlimited interview plans",
    "Resume analysis and match score",
    "Mock interviews with every answer scored",
    "Adaptive follow-up questions",
    "Day-by-day preparation roadmap",
    "AI interview assistant",
    "Tailored resume and report PDF export"
]

const PRO_FEATURES = [
    "Everything in Starter",
    "Camera mock interviews — expression, gesture, posture, confidence (Coming Soon)",
    "Voice answers with spoken feedback (Coming Soon)",
    "Company-specific question banks",
    "Deeper progress tracking across sessions"
]

// Mirrors the rubric the backend actually grades against
// (see Backend/src/services/ai.service.js).
const SCORING_DIMENSIONS = [
    { name: "Relevance", description: "Did you answer the question that was actually asked, or drift into something adjacent you were more comfortable with?" },
    { name: "Depth", description: "How substantive was your reasoning, judged against the seniority the job description implies." },
    { name: "Structure", description: "Was the answer organised and easy to follow? Behavioural answers are rewarded for clear situation, action and result." },
    { name: "Clarity", description: "Concise communication that a real interviewer could follow, without rambling or filler." },
    { name: "Specificity", description: "Concrete examples, real numbers and outcomes from your own experience instead of generic statements." }
]

const Landing = () => {
    const navigate = useNavigate()
    const [activeFaq, setActiveFaq] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [demoJd, setDemoJd] = useState("")
    const [demoResumeName, setDemoResumeName] = useState("")
    const [demoGate, setDemoGate] = useState(false)
    const toast = useToast()

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index)
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDemoSubmit = (e) => {
        e.preventDefault()
        if (!demoJd.trim() && !demoResumeName) {
            toast?.error("Add a job description or resume first — then sign in to run the analysis.")
            return
        }
        setDemoGate(true)
    }

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="landing">
            <SEO 
                title="Master Your Interview, Land Your Dream Job"
                description="AI-powered interview preparation platform. Get personalized coaching, practice with real questions, and receive instant feedback to ace your technical and behavioral interviews."
                keywords="interview prep, AI coach, technical interview, behavioral interview, job search"
            />

            {/* Hero */}
            <section className="hero">
                <div className="hero__container">
                    <div className="hero__badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
                        </svg>
                        AI-Powered Interview Preparation
                    </div>
                    <h1 className="hero__title">
                        Master Your Interview,<br />
                        <span className="text-gradient">Land Your Dream Job</span>
                    </h1>
                    <p className="hero__subtitle">
                        Get personalized AI coaching, practice with real interview questions, and receive instant feedback to ace your technical and behavioral interviews.
                    </p>
                    <div className="hero__actions">
                        <a href="#try-it" className="hero__cta hero__cta--primary">
                            Try with your resume
                        </a>
                        <a href="#how-it-works" className="hero__cta hero__cta--secondary">
                            See how it works
                        </a>
                    </div>
                    <div className="hero__stats">
                        <div className="hero__stat">
                            <div className="hero__stat-value">Scored</div>
                            <div className="hero__stat-label">Every answer graded on 5 dimensions</div>
                        </div>
                        <div className="hero__stat">
                            <div className="hero__stat-value">Adaptive</div>
                            <div className="hero__stat-label">Follow-ups probe where you're weak</div>
                        </div>
                        <div className="hero__stat">
                            <div className="hero__stat-value">Free</div>
                            <div className="hero__stat-label">No card, no trial limit</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive try-it — same shape as the real interview form */}
            <section id="try-it" className="try-it">
                <div className="try-it__container">
                    <div className="section-header">
                        <span className="section-badge">Try it</span>
                        <h2>Upload your resume. Paste the job you want.</h2>
                        <p>This is the same flow you get after signing in. Submit to continue — account required to run the AI analysis.</p>
                    </div>

                    <form className="try-it__card" onSubmit={handleDemoSubmit}>
                        <label className="try-it__field">
                            <span>Target job description</span>
                            <Textarea
                                placeholder="Paste the job description you're targeting..."
                                value={demoJd}
                                onChange={(e) => setDemoJd(e.target.value)}
                                rows={5}
                                fullWidth
                            />
                        </label>

                        <div className="try-it__field">
                            <FileUpload
                                label="Upload resume (PDF)"
                                accept=".pdf"
                                maxSize={5 * 1024 * 1024}
                                onFileSelect={(file) => setDemoResumeName(file?.name || "")}
                                hint="PDF up to 5MB — analysis runs after you sign in"
                            />
                            {demoResumeName && (
                                <p className="try-it__file-name">Selected: {demoResumeName}</p>
                            )}
                        </div>

                        {demoGate && (
                            <Alert
                                variant="info"
                                title="Login or register to continue"
                                message="Create a free account (or sign in) to analyze this resume against the job description, get your match score, roadmap, and scored practice interview."
                            />
                        )}

                        <div className="try-it__actions">
                            {!demoGate ? (
                                <Button type="submit" variant="primary" size="lg">
                                    Analyze resume
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="lg"
                                        onClick={() => navigate("/register", {
                                            state: {
                                                message: "Register to continue — we'll use your resume and job description after you create an account.",
                                                from: "/interview/new"
                                            }
                                        })}
                                    >
                                        Register to continue
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => navigate("/login", {
                                            state: {
                                                message: "Sign in to continue with your resume analysis.",
                                                from: "/interview/new"
                                            }
                                        })}
                                    >
                                        Login to continue
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="features">
                <div className="features__container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2>Everything You Need to Ace Your Interview</h2>
                        <p>Comprehensive AI-powered tools designed to prepare you for success</p>
                    </div>
                    
                    <div className="features__grid">
                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <h3>Resume Analysis</h3>
                            <p>AI analyzes your resume against job requirements to identify strengths and gaps</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--accent">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3>Custom Interview Questions</h3>
                            <p>Get personalized technical and behavioral questions tailored to your target role</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--warning">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <h3>Preparation Roadmap</h3>
                            <p>Day-by-day study plan to systematically close skill gaps and boost confidence</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--error">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                            </div>
                            <h3>Match Score Analysis</h3>
                            <p>Detailed breakdown of how well you match the role across multiple dimensions</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--info">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
                                </svg>
                            </div>
                            <h3>24/7 AI Assistant</h3>
                            <p>Ask questions, get instant feedback, and practice anytime with your personal AI coach</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-card__icon feature-card__icon--success">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3>Interview History</h3>
                            <p>Track your progress, review past preparations, and see your improvement over time</p>
                        </div>

                        <div className="feature-card feature-card--soon" aria-disabled="true">
                            <div className="feature-card__icon feature-card__icon--accent">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </div>
                            <h3>Camera AI mock interviews <span className="section-badge">Coming Soon</span></h3>
                            <p>
                                In the future: answer on screen while AI reviews facial expression, gesture, posture, and confidence.
                                Not available to use yet — today&apos;s practice is text-based scored interviews.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preview */}
            <section className="preview">
                <div className="preview__container">
                    <div className="section-header">
                        <span className="section-badge">Preview</span>
                        <h2>See HirePilot AI in Action</h2>
                        <p>Get a glimpse of our AI-powered interview preparation platform</p>
                    </div>

                    <div className="preview__mockup">
                        <div className="preview__browser">
                            <div className="preview__browser-bar">
                                <div className="preview__browser-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className="preview__browser-url">hirepilot.ai/interview/report</div>
                            </div>
                            <div className="preview__browser-content">
                                <div className="preview__card">
                                    <div className="preview__card-header">
                                        <div className="preview__badge">Match Score</div>
                                    </div>
                                    <div className="preview__score">
                                        <div className="preview__score-ring">
                                            <span>87</span>
                                            <small>%</small>
                                        </div>
                                    </div>
                                    <div className="preview__metrics">
                                        <div className="preview__metric">
                                            <span>Technical Skills</span>
                                            <div className="preview__bar">
                                                <div className="preview__bar-fill" style={{ width: '90%' }}></div>
                                            </div>
                                        </div>
                                        <div className="preview__metric">
                                            <span>Communication</span>
                                            <div className="preview__bar">
                                                <div className="preview__bar-fill" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                        <div className="preview__metric">
                                            <span>Experience</span>
                                            <div className="preview__bar">
                                                <div className="preview__bar-fill" style={{ width: '88%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="how-it-works">
                <div className="how-it-works__container">
                    <div className="section-header">
                        <span className="section-badge">How It Works</span>
                        <h2>Get Interview-Ready in 3 Simple Steps</h2>
                        <p>Our AI-powered process makes interview preparation effortless</p>
                    </div>

                    <div className="steps">
                        <div className="step">
                            <div className="step__number">01</div>
                            <div className="step__content">
                                <h3>Upload Resume & Job Description</h3>
                                <p>Share your resume and paste the job description you're targeting. Our AI will analyze both to understand your unique profile and the role requirements.</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step__number">02</div>
                            <div className="step__content">
                                <h3>Get Your AI-Generated Plan</h3>
                                <p>Receive a personalized interview preparation plan with custom questions, skill gap analysis, and a day-by-day roadmap to close those gaps.</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step__number">03</div>
                            <div className="step__content">
                                <h3>Practice & Ace Your Interview</h3>
                                <p>Use your personalized questions to practice, get instant AI feedback, and track your progress until you're 100% confident.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="stats-banner">
                <div className="stats-banner__container">
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">5</span>
                        </div>
                        <div className="stats-banner__label">Dimensions scored per answer</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">4</span>
                        </div>
                        <div className="stats-banner__label">Dimensions in your match score</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">&infin;</span>
                        </div>
                        <div className="stats-banner__label">Practice sessions, no cap</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            $<span className="stats-banner__count">0</span>
                        </div>
                        <div className="stats-banner__label">Cost to use everything</div>
                    </div>
                </div>
            </section>

            {/* Why HirePilot AI — desktop/tablet; hidden on phones to cut scroll */}
            <section className="why-section landing-desktop-only">
                <div className="why-section__container">
                    <div className="section-header">
                        <span className="section-badge">Why Choose Us</span>
                        <h2>The Smarter Way to Prepare</h2>
                        <p>Traditional interview prep wastes time on generic advice. We use AI to personalize everything.</p>
                    </div>

                    <div className="why-grid">
                        <div className="why-card">
                            <div className="why-card__number">01</div>
                            <h3>AI-Powered Personalization</h3>
                            <p>Every question, roadmap, and recommendation is tailored specifically to your resume and target role. No generic content.</p>
                        </div>

                        <div className="why-card">
                            <div className="why-card__number">02</div>
                            <h3>Save 10+ Hours</h3>
                            <p>Skip the manual research. Get a comprehensive interview plan with questions, study resources, and a roadmap in minutes.</p>
                        </div>

                        <div className="why-card">
                            <div className="why-card__number">03</div>
                            <h3>Know Your Gaps</h3>
                            <p>Get an honest match score and detailed analysis of where you're strong and where you need improvement.</p>
                        </div>

                        <div className="why-card">
                            <div className="why-card__number">04</div>
                            <h3>Practice With Confidence</h3>
                            <p>Every interview is different. Our AI generates role-specific questions you won't find in generic interview books.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How answers are scored — desktop/tablet */}
            <section id="scoring" className="why-section landing-desktop-only">
                <div className="why-section__container">
                    <div className="section-header">
                        <span className="section-badge">Scoring</span>
                        <h2>How Every Answer Gets Scored</h2>
                        <p>No vague "great job". Each answer is graded on five dimensions so you know exactly what to fix.</p>
                    </div>

                    <div className="why-grid">
                        {SCORING_DIMENSIONS.map((dimension, index) => (
                            <div className="why-card" key={dimension.name}>
                                <div className="why-card__number">{String(index + 1).padStart(2, "0")}</div>
                                <h3>{dimension.name}</h3>
                                <p>{dimension.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ — full list on desktop; phones use /faq via footer */}
            <section id="faq" className="faq landing-desktop-only">
                <div className="faq__container">
                    <div className="section-header">
                        <span className="section-badge">FAQ</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Everything you need to know about HirePilot AI</p>
                    </div>

                    <div className="faq__list">
                        {[
                            {
                                q: "How does the AI analyze my resume?",
                                a: "Upload a PDF resume and paste a job description. HirePilot AI extracts your background, compares it to that role, and returns a match score, strengths, skill gaps, tailored questions, and a preparation roadmap."
                            },
                            {
                                q: "Is the mock interview scored?",
                                a: "Yes — today's practice is text-based. Each answer is scored on relevance, depth, structure, clarity, and specificity, with feedback before the next question."
                            },
                            {
                                q: "Will you analyze my camera and body language?",
                                a: "Not yet. Coming soon: AI mock interviews that review facial expression, gesture, posture, and confidence while you answer on screen. That mode is not selectable today."
                            },
                            {
                                q: "Is login free? Do I need paid SMS OTP?",
                                a: "Yes, Starter is free. Login and forgot-password use a free email OTP (no paid SMS). On local setups without email configured, the OTP is shown on screen so you can still sign in."
                            },
                            {
                                q: "Can I prepare for multiple jobs?",
                                a: "Yes. Create separate interview plans for different job descriptions — each one is customized to that role."
                            },
                            {
                                q: "Do I need special software?",
                                a: "No. HirePilot AI runs in your browser on desktop and mobile."
                            }
                        ].map((faq, index) => (
                            <div key={index} className={`faq__item ${activeFaq === index ? 'faq__item--active' : ''}`}>
                                <button className="faq__question" onClick={() => toggleFaq(index)}>
                                    <span>{faq.q}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                <div className="faq__answer">
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing — Starter available; Professional informational only */}
            <section id="pricing" className="pricing">
                <div className="pricing__container">
                    <div className="section-header">
                        <span className="section-badge">Pricing</span>
                        <h2>Simple pricing in ₹</h2>
                        <p>Starter works today. Camera and voice interview modes are Coming Soon — not selectable yet.</p>
                    </div>

                    <div className="pricing-page__grid" aria-label="Pricing plans">
                        <div className="plan-card plan-card--selected" aria-current="true">
                            <span className="plan-card__badge">Available now</span>
                            <h3 className="plan-card__name">Starter</h3>
                            <div className="plan-card__price">
                                <span className="plan-card__amount">₹0</span>
                                <span className="plan-card__period">/month</span>
                            </div>
                            <p className="plan-card__description">Full access while we build. No card required.</p>
                            <ul className="plan-card__features">
                                {STARTER_FEATURES.map((feature) => (
                                    <li key={feature}><CheckIcon />{feature}</li>
                                ))}
                            </ul>
                            <div className="plan-card__cta">
                                <Link to="/register" className="button primary-button">
                                    Get started free
                                </Link>
                            </div>
                        </div>

                        <div className="plan-card plan-card--pro plan-card--disabled" aria-disabled="true">
                            <span className="plan-card__badge plan-card__badge--soon">Coming Soon</span>
                            <h3 className="plan-card__name">Professional</h3>
                            <div className="plan-card__price">
                                <span className="plan-card__amount">₹1,499</span>
                                <span className="plan-card__period">/month</span>
                            </div>
                            <p className="plan-card__description">
                                Planned later — AI mock interviews that read on-screen answers and analyze expression, gesture, posture and confidence. Not available to buy or select yet.
                            </p>
                            <ul className="plan-card__features">
                                {PRO_FEATURES.map((feature) => (
                                    <li key={feature}><CheckIcon />{feature}</li>
                                ))}
                            </ul>
                            <div className="plan-card__cta">
                                <button
                                    type="button"
                                    className="button secondary-button"
                                    onClick={() => toast?.success("Noted. We'll announce Professional when camera/voice interviews ship.")}
                                >
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="pricing-page__note">
                        Coming Soon is informational only.{" "}
                        <Link to="/pricing">View full pricing</Link>
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="cta">
                <div className="cta__container">
                    <h2>Ready to find out where you actually stand?</h2>
                    <p>Upload your resume, paste a job description, and get your first scored mock interview in minutes.</p>
                    <Link to="/register" className="cta__button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
                        </svg>
                        Start Free Today
                    </Link>
                </div>
            </section>

            {/* Scroll to Top */}
            <button
                type="button"
                className={`scroll-to-top ${showScrollTop ? 'scroll-to-top--visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </div>
    )
}

export default Landing
