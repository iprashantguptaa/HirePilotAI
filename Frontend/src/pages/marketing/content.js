/**
 * Production-ready copy for every public marketing / legal page.
 * Kept in one place so routes stay thin and content stays consistent.
 */

export const MARKETING_PAGES = {
    features: {
        title: "Features",
        eyebrow: "Product",
        description: "Everything HirePilot AI gives you to prepare for a real interview — not a generic quiz.",
        sections: [
            {
                heading: "Resume and role matching",
                body: "Upload your resume and paste a job description. HirePilot AI scores how well you fit across technical skills, communication, experience and culture fit, then lists your strengths and skill gaps for that specific role."
            },
            {
                heading: "Interview question bank",
                body: "Get technical and behavioural questions tailored to the role, with interviewer intention and a model answer for each — so you know what a strong response actually covers."
            },
            {
                heading: "Scored mock interviews",
                body: "Practise one question at a time. Every answer is graded on relevance, depth, structure, clarity and specificity. Vague answers are scored honestly. Strong answers earn higher marks."
            },
            {
                heading: "Adaptive follow-ups",
                body: "When an answer is shallow, the next question presses on what you left out — the same way a real interviewer would."
            },
            {
                heading: "Preparation roadmap",
                body: "A day-by-day plan focused on your gaps, so you know what to study tomorrow instead of staring at a blank notes app."
            },
            {
                heading: "AI interview assistant",
                body: "Chat against your report context when you want qualitative coaching between scored practice sessions."
            },
            {
                heading: "Exports",
                body: "Download a tailored resume PDF and a full interview report PDF when you need something to review offline or share with a mentor."
            }
        ]
    },

    pricing: {
        title: "Pricing",
        eyebrow: "Plans",
        description: "Clear pricing in Indian Rupees. Start free. Professional is coming soon.",
        // Handled by the dedicated Pricing page component for interactive cards.
        interactive: true
    },

    about: {
        title: "About HirePilot AI",
        eyebrow: "Company",
        description: "We build AI career coaching that tells you the truth about where you stand — then helps you close the gap.",
        sections: [
            {
                heading: "Our mission",
                body: "Most interview prep is either too generic or too expensive. HirePilot AI exists to give every candidate in India and beyond a personal AI coach that understands their resume, the role they want, and how they actually answer questions."
            },
            {
                heading: "What we believe",
                body: "Feedback should be specific. Scores should be honest. Practice should feel like the real interview. Marketing copy should never claim features that don't exist yet."
            },
            {
                heading: "Based in India",
                body: "HirePilot AI India Private Limited is building from Bengaluru. We design for Indian candidates first — INR pricing, local context, and workflows that fit how people here actually prepare for interviews."
            },
            {
                heading: "Contact",
                body: "General: hello@hirepilot.ai · Support: support@hirepilot.ai · Business: business@hirepilot.ai"
            }
        ]
    },

    contact: {
        title: "Contact",
        eyebrow: "Get in touch",
        description: "We read every message. Pick the channel that matches what you need.",
        sections: [
            {
                heading: "Product support",
                body: "Email support@hirepilot.ai with your account email, what you were trying to do, and what went wrong. We typically reply within 1–2 business days."
            },
            {
                heading: "Sales and partnerships",
                body: "For universities, bootcamps and hiring partners: business@hirepilot.ai"
            },
            {
                heading: "Press",
                body: "press@hirepilot.ai"
            },
            {
                heading: "Office",
                body: "HirePilot AI India Private Limited · Bengaluru, Karnataka, India · +91 80 4567 8900"
            }
        ]
    },

    faq: {
        title: "Frequently asked questions",
        eyebrow: "FAQ",
        description: "Straight answers about how HirePilot AI works.",
        sections: [
            {
                heading: "How does resume analysis work?",
                body: "You upload a PDF resume and paste a job description. Our AI extracts your background, compares it to the role, and returns a match score, breakdown, strengths, skill gaps, questions and a preparation plan."
            },
            {
                heading: "Is the mock interview scored?",
                body: "Yes. Each answer is scored on five dimensions: relevance, depth, structure, clarity and specificity. You see feedback before the next question."
            },
            {
                heading: "Is voice interview available?",
                body: "Not yet. Practice is text-first today. Voice is on the roadmap and listed as Coming Soon on pricing — we do not pretend it ships already."
            },
            {
                heading: "Is my data private?",
                body: "Your resume and answers are used to generate your reports and practice feedback. We do not sell personal data. See the Privacy Policy for details."
            },
            {
                heading: "Can I use it for multiple roles?",
                body: "Yes. Create as many interview plans as you need. Each plan is scoped to one job description."
            },
            {
                heading: "Do I need to install anything?",
                body: "No. HirePilot AI runs in the browser on desktop, tablet and mobile."
            }
        ]
    },

    "how-it-works": {
        title: "How it works",
        eyebrow: "Workflow",
        description: "Three steps from resume to scored practice.",
        sections: [
            {
                heading: "1. Upload resume and job description",
                body: "Share your PDF resume and the role you are targeting. Optionally add a short self-description."
            },
            {
                heading: "2. Get your AI interview plan",
                body: "Receive a match score, skill gaps, technical and behavioural questions with model answers, and a day-by-day roadmap."
            },
            {
                heading: "3. Practise and improve",
                body: "Start a scored mock interview from that plan. Answer one question at a time, review the rubric, and come back until your weak dimensions move."
            }
        ]
    },

    blog: {
        title: "Blog",
        eyebrow: "Insights",
        description: "Practical interview and career writing from the HirePilot AI team.",
        sections: [
            {
                heading: "Why generic interview lists fail",
                body: "Memorising 50 random questions does not prepare you for a role-specific screen. Ground practice in your resume and the job description, then score the answers you actually give."
            },
            {
                heading: "How to read a match score without panicking",
                body: "A 60% match is not a rejection — it is a map. Look at the skill gaps and the preparation plan. Close the high-severity gaps first."
            },
            {
                heading: "What good behavioural answers sound like",
                body: "Situation, action, result — with numbers. HirePilot AI's specificity score exists because interviewers reward concrete outcomes, not adjectives."
            },
            {
                heading: "More posts coming",
                body: "We publish when we have something useful, not on a fake weekly cadence. Subscribe via support@hirepilot.ai if you want updates."
            }
        ]
    },

    careers: {
        title: "Careers",
        eyebrow: "Join us",
        description: "We are a small team building AI career coaching from Bengaluru.",
        sections: [
            {
                heading: "Open roles",
                body: "We are not hiring for full-time roles publicly right now. When we are, listings will appear here with clear responsibilities and INR compensation ranges."
            },
            {
                heading: "How to introduce yourself",
                body: "Email careers notes to business@hirepilot.ai with a short note on what you want to build and a link to work you are proud of. No cover-letter theatre required."
            },
            {
                heading: "Internships",
                body: "Occasional product, design and engineering internships open around academic calendars. Watch this page."
            }
        ]
    },

    support: {
        title: "Support",
        eyebrow: "Help",
        description: "Get unstuck fast.",
        sections: [
            {
                heading: "Help Center",
                body: "Start with the FAQ for common product questions. For account or billing issues, email support@hirepilot.ai."
            },
            {
                heading: "What to include in a support email",
                body: "Your account email, the page URL, what you expected, what happened, and a screenshot if something looks broken."
            },
            {
                heading: "Response time",
                body: "We aim to reply within 1–2 business days. Production outages are tracked on the Status page."
            }
        ]
    },

    security: {
        title: "Security",
        eyebrow: "Trust",
        description: "How we protect accounts and candidate data.",
        sections: [
            {
                heading: "Transport",
                body: "Production traffic is served over HTTPS. Cookies that authenticate you are HttpOnly and use Secure + SameSite settings appropriate for cross-origin deployment."
            },
            {
                heading: "Passwords",
                body: "Passwords are hashed with bcrypt before storage. We never store plaintext passwords."
            },
            {
                heading: "Sessions",
                body: "Short-lived access tokens are paired with rotating refresh tokens. Logout blacklists the access token and revokes the refresh token."
            },
            {
                heading: "Reporting a vulnerability",
                body: "Email security concerns to support@hirepilot.ai with enough detail to reproduce. Please do not publicly disclose before we have had a reasonable chance to fix the issue."
            }
        ]
    },

    status: {
        title: "System status",
        eyebrow: "Uptime",
        description: "Current operational status of HirePilot AI services.",
        sections: [
            {
                heading: "Web application",
                body: "Operational when https://hirepilot-frontend-mu.vercel.app loads and authenticates successfully."
            },
            {
                heading: "API",
                body: "Operational when the Render-hosted API responds on /api/health. Free-tier hosts may cold-start and take up to a minute after idle periods."
            },
            {
                heading: "AI generation",
                body: "Depends on Google Gemini availability and account quota. If generation fails with a temporary busy message, wait and retry."
            },
            {
                heading: "Incidents",
                body: "Major incidents will be summarised here. For urgent help during an outage, email support@hirepilot.ai."
            }
        ]
    },

    documentation: {
        title: "Documentation",
        eyebrow: "Docs",
        description: "How to use HirePilot AI day to day.",
        sections: [
            {
                heading: "Create an interview plan",
                body: "Sign in → New interview → paste the job description → upload resume PDF → generate. Open the report to review score, questions and roadmap."
            },
            {
                heading: "Run a practice session",
                body: "From the report, click Practise this interview (or open Practice in the navbar). Choose mode and question count, then answer one question at a time."
            },
            {
                heading: "Profile resume",
                body: "Save a default resume on your Profile so practice sessions started from a pasted job description can reuse it."
            },
            {
                heading: "API access",
                body: "A public partner API is not generally available yet. Partnership enquiries: business@hirepilot.ai."
            }
        ]
    },

    privacy: {
        title: "Privacy Policy",
        eyebrow: "Legal",
        description: "Last updated: 3 August 2026",
        sections: [
            {
                heading: "Who we are",
                body: "HirePilot AI India Private Limited (“HirePilot AI”, “we”, “us”) operates the HirePilot AI web application. Contact: hello@hirepilot.ai."
            },
            {
                heading: "Data we collect",
                body: "Account data (username, email, hashed password), profile data you choose to add, resumes and job descriptions you upload, interview reports and practice transcripts, usage logs needed to operate AI features, and basic technical logs (IP, user agent) for security."
            },
            {
                heading: "How we use data",
                body: "To create and secure your account, generate interview plans and practice feedback, improve reliability, prevent abuse, and communicate about the service when necessary."
            },
            {
                heading: "AI processing",
                body: "Resume text, job descriptions and practice answers are sent to our AI provider (Google Gemini) to generate the outputs you request. Do not upload data you are not allowed to process."
            },
            {
                heading: "Sharing",
                body: "We do not sell personal data. We use infrastructure providers (hosting, database, email, AI) as processors to run the product."
            },
            {
                heading: "Retention and deletion",
                body: "You may delete your account from Profile settings. Associated reports and practice data are removed with the account subject to short-lived backups and legal holds if required."
            },
            {
                heading: "Your rights",
                body: "Depending on applicable law, you may request access, correction or deletion by emailing support@hirepilot.ai from your account email."
            },
            {
                heading: "Contact",
                body: "Privacy questions: support@hirepilot.ai"
            }
        ]
    },

    terms: {
        title: "Terms of Service",
        eyebrow: "Legal",
        description: "Last updated: 3 August 2026",
        sections: [
            {
                heading: "Agreement",
                body: "By creating an account or using HirePilot AI, you agree to these Terms. If you do not agree, do not use the service."
            },
            {
                heading: "The service",
                body: "HirePilot AI provides AI-assisted interview preparation tools. Outputs are guidance, not guarantees of hiring outcomes. You remain responsible for how you use the advice."
            },
            {
                heading: "Accounts",
                body: "You must provide accurate registration information and keep credentials secure. You are responsible for activity under your account."
            },
            {
                heading: "Acceptable use",
                body: "Do not abuse the API, attempt to break security, upload unlawful content, or use the product to harass others. We may suspend accounts that violate these rules."
            },
            {
                heading: "Intellectual property",
                body: "The product UI, brand and software are owned by HirePilot AI. You retain rights to content you upload; you grant us a licence to process it as needed to provide the service."
            },
            {
                heading: "Disclaimer",
                body: "The service is provided “as is”. We do not warrant uninterrupted availability or that AI outputs will be error-free."
            },
            {
                heading: "Limitation of liability",
                body: "To the maximum extent permitted by law, HirePilot AI is not liable for indirect or consequential damages arising from use of the service."
            },
            {
                heading: "Governing law",
                body: "These Terms are governed by the laws of India. Courts in Bengaluru, Karnataka shall have exclusive jurisdiction, subject to mandatory consumer protections."
            },
            {
                heading: "Contact",
                body: "legal questions: hello@hirepilot.ai"
            }
        ]
    },

    cookies: {
        title: "Cookie Policy",
        eyebrow: "Legal",
        description: "Last updated: 3 August 2026",
        sections: [
            {
                heading: "What we use cookies for",
                body: "Essential authentication cookies (access and refresh tokens) keep you signed in. Preference storage such as theme may use localStorage rather than cookies."
            },
            {
                heading: "Essential cookies",
                body: "HttpOnly cookies set by the API are required for login sessions. The product cannot function while signed in without them."
            },
            {
                heading: "Analytics",
                body: "We do not currently run third-party advertising cookies. If that changes, this policy will be updated before they are enabled."
            },
            {
                heading: "Managing cookies",
                body: "You can clear cookies in your browser. Doing so will sign you out of HirePilot AI."
            }
        ]
    }
}

export const MARKETING_SLUGS = Object.keys(MARKETING_PAGES)
