import { Link } from "react-router"
import { useState, useEffect } from "react"
import { Logo } from "../components/common/Logo"
import { SEO } from "../components/common"
import "./Landing.scss"

const Landing = () => {
    const [activeFaq, setActiveFaq] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index)
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
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
            
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav__container">
                    <Logo size="md" />
                    <div className={`landing-nav__links ${mobileMenuOpen ? 'landing-nav__links--open' : ''}`}>
                        <a href="#features" onClick={closeMobileMenu}>Features</a>
                        <a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a>
                        <a href="#faq" onClick={closeMobileMenu}>FAQ</a>
                    </div>
                    <div className="landing-nav__actions">
                        <Link to="/login" className="landing-nav__login">Login</Link>
                        <Link to="/register" className="landing-nav__cta">Get Started</Link>
                    </div>
                    <button className="landing-nav__hamburger" onClick={toggleMobileMenu} aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

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
                        <Link to="/register" className="hero__cta hero__cta--primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
                            </svg>
                            Start Free Today
                        </Link>
                        <a href="#how-it-works" className="hero__cta hero__cta--secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                            Watch Demo
                        </a>
                    </div>
                    <div className="hero__stats">
                        <div className="hero__stat">
                            <div className="hero__stat-value">10,000+</div>
                            <div className="hero__stat-label">Interviews Prepared</div>
                        </div>
                        <div className="hero__stat">
                            <div className="hero__stat-value">95%</div>
                            <div className="hero__stat-label">Success Rate</div>
                        </div>
                        <div className="hero__stat">
                            <div className="hero__stat-value">24/7</div>
                            <div className="hero__stat-label">AI Assistant</div>
                        </div>
                    </div>
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
                            <span className="stats-banner__count">10,000</span>+
                        </div>
                        <div className="stats-banner__label">Interviews Prepared</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">95</span>%
                        </div>
                        <div className="stats-banner__label">Success Rate</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">4.9</span>/5
                        </div>
                        <div className="stats-banner__label">Average Rating</div>
                    </div>
                    <div className="stats-banner__divider"></div>
                    <div className="stats-banner__item">
                        <div className="stats-banner__value">
                            <span className="stats-banner__count">24</span>/7
                        </div>
                        <div className="stats-banner__label">AI Assistant</div>
                    </div>
                </div>
            </section>

            {/* Why HirePilot AI */}
            <section className="why-section">
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

            {/* Testimonials */}
            <section className="testimonials">
                <div className="testimonials__container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2>Loved by Candidates Worldwide</h2>
                        <p>Join thousands who prepared with HirePilot AI and landed their dream jobs</p>
                    </div>

                    <div className="testimonials__grid">
                        <div className="testimonial-card">
                            <div className="testimonial-card__stars">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-card__text">
                                "HirePilot AI helped me identify gaps I didn't even know I had. The personalized roadmap was exactly what I needed to prepare confidently."
                            </p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">S</div>
                                <div>
                                    <div className="testimonial-card__name">Sarah Chen</div>
                                    <div className="testimonial-card__role">Software Engineer at Google</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-card__stars">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-card__text">
                                "The AI-generated questions were spot-on. I encountered similar questions in my actual interview and felt completely prepared."
                            </p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">M</div>
                                <div>
                                    <div className="testimonial-card__name">Michael Rodriguez</div>
                                    <div className="testimonial-card__role">Product Manager at Amazon</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-card__stars">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-card__text">
                                "Best interview prep tool I've used. The match score gave me realistic expectations and the 24/7 AI assistant answered all my questions."
                            </p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">P</div>
                                <div>
                                    <div className="testimonial-card__name">Priya Patel</div>
                                    <div className="testimonial-card__role">Data Scientist at Microsoft</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="faq">
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
                                a: "Our AI uses advanced natural language processing to extract key skills, experience, and qualifications from your resume. It then compares these against the job requirements to identify your strengths and areas for improvement."
                            },
                            {
                                q: "What types of interviews can I prepare for?",
                                a: "HirePilot AI supports preparation for technical interviews (coding, system design), behavioral interviews (STAR method), and role-specific interviews across various industries including software engineering, product management, and more."
                            },
                            {
                                q: "Is my data secure and private?",
                                a: "Absolutely. We use industry-standard encryption to protect your data. Your resume and personal information are never shared with third parties, and you can delete your data at any time."
                            },
                            {
                                q: "Can I use this for multiple job applications?",
                                a: "Yes! Create unlimited interview preparation plans for different roles. Each plan is customized to match the specific job description you're targeting."
                            },
                            {
                                q: "How accurate is the match score?",
                                a: "Our match score is based on comprehensive analysis across technical skills, communication, experience, and culture fit. While it's a helpful guide, we recommend using it alongside your own judgment and research."
                            },
                            {
                                q: "Do I need any special software to use HirePilot AI?",
                                a: "No special software required! HirePilot AI works directly in your web browser on any device - desktop, tablet, or mobile."
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

            {/* Pricing */}
            <section className="pricing">
                <div className="pricing__container">
                    <div className="section-header">
                        <span className="section-badge">Pricing</span>
                        <h2>Simple, Transparent Pricing</h2>
                        <p>Start preparing for your dream job today, completely free</p>
                    </div>

                    <div className="pricing__grid">
                        <div className="pricing-card">
                            <div className="pricing-card__badge">Free Forever</div>
                            <h3 className="pricing-card__name">Starter</h3>
                            <div className="pricing-card__price">
                                <span className="pricing-card__amount">$0</span>
                                <span className="pricing-card__period">/month</span>
                            </div>
                            <p className="pricing-card__description">Perfect for getting started with AI-powered interview prep</p>
                            <ul className="pricing-card__features">
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    3 Interview Plans per month
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Basic AI Assistant
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Resume Analysis
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Match Score
                                </li>
                            </ul>
                            <Link to="/register" className="pricing-card__cta">Get Started Free</Link>
                        </div>

                        <div className="pricing-card pricing-card--featured">
                            <div className="pricing-card__badge pricing-card__badge--coming">Coming Soon</div>
                            <h3 className="pricing-card__name">Pro</h3>
                            <div className="pricing-card__price">
                                <span className="pricing-card__amount">$19</span>
                                <span className="pricing-card__period">/month</span>
                            </div>
                            <p className="pricing-card__description">For serious candidates preparing for multiple roles</p>
                            <ul className="pricing-card__features">
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Unlimited Interview Plans
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Advanced AI Assistant
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Mock Interview Simulations
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Video Interview Practice
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Priority Support
                                </li>
                            </ul>
                            <button className="pricing-card__cta" disabled>Notify Me</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta">
                <div className="cta__container">
                    <h2>Ready to Land Your Dream Job?</h2>
                    <p>Join thousands of successful candidates who prepared with HirePilot AI</p>
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
                className={`scroll-to-top ${showScrollTop ? 'scroll-to-top--visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer__container">
                    <div className="landing-footer__top">
                        <div className="landing-footer__brand">
                            <Logo size="md" />
                            <p>AI-powered interview preparation platform helping candidates land their dream jobs.</p>
                        </div>
                        <div className="landing-footer__links">
                            <div className="landing-footer__column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#how-it-works">How It Works</a>
                                <Link to="/register">Get Started</Link>
                            </div>
                            <div className="landing-footer__column">
                                <h4>Company</h4>
                                <a href="#faq">FAQ</a>
                                <Link to="/feedback">Feedback</Link>
                            </div>
                            <div className="landing-footer__column">
                                <h4>Legal</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                    <div className="landing-footer__bottom">
                        <p>&copy; 2026 HirePilot AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
