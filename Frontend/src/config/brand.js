// ============================================================================
// HirePilot AI - Brand Configuration
// ============================================================================
// SINGLE SOURCE OF TRUTH for all branding across the application
// To rebrand: modify this file only, everything else updates automatically
// ============================================================================

export const BRAND = {
  // ============================================================================
  // PRODUCT IDENTITY
  // ============================================================================
  
  product: {
    name: 'HirePilot AI',
    tagline: 'Master Your Interview, Land Your Dream Job',
    description: 'AI-powered interview preparation platform that helps you ace technical and behavioral interviews with personalized coaching, real-time feedback, and comprehensive skill assessment.',
    version: '1.0.0'
  },

  // ============================================================================
  // COMPANY INFORMATION
  // ============================================================================
  
  company: {
    name: 'HirePilot AI India Pvt Ltd',
    legalName: 'HirePilot AI India Private Limited',
    founded: '2026',
    location: 'Bengaluru, Karnataka, India'
  },

  // ============================================================================
  // CONTACT & SUPPORT
  // ============================================================================
  
  contact: {
    email: 'hello@hirepilot.ai',
    supportEmail: 'support@hirepilot.ai',
    businessEmail: 'business@hirepilot.ai',
    pressEmail: 'press@hirepilot.ai',
    website: 'https://hirepilot.ai',
    phone: '+91 80 4567 8900'
  },

  // ============================================================================
  // SOCIAL LINKS
  // ============================================================================
  
  social: {
    twitter: {
      username: '@HirePilotAI',
      url: 'https://twitter.com/HirePilotAI'
    },
    linkedin: {
      username: 'hirepilot-ai',
      url: 'https://linkedin.com/company/hirepilot-ai'
    },
    github: {
      username: 'hirepilot-ai',
      url: 'https://github.com/hirepilot-ai'
    },
    youtube: {
      username: '@HirePilotAI',
      url: 'https://youtube.com/@HirePilotAI'
    },
    discord: {
      inviteCode: 'hirepilot',
      url: 'https://discord.gg/hirepilot'
    },
    instagram: {
      username: '@hirepilot.ai',
      url: 'https://instagram.com/hirepilot.ai'
    }
  },

  // ============================================================================
  // LEGAL & COPYRIGHT
  // ============================================================================
  
  legal: {
    copyright: `© ${new Date().getFullYear()} HirePilot AI India Pvt Ltd. All rights reserved.`,
    privacyPolicyUrl: '/legal/privacy',
    termsOfServiceUrl: '/legal/terms',
    cookiePolicyUrl: '/legal/cookies',
    gdprUrl: '/legal/gdpr'
  },

  // ============================================================================
  // THEME & BRAND COLORS
  // ============================================================================
  
  theme: {
    primary: {
      name: 'Confident Purple',
      hex: '#7c3aed',
      rgb: 'rgb(124, 58, 237)',
      cssVar: '--color-primary-600'
    },
    secondary: {
      name: 'Trust Blue',
      hex: '#3b82f6',
      rgb: 'rgb(59, 130, 246)',
      cssVar: '--color-secondary-500'
    },
    accent: {
      name: 'Growth Green',
      hex: '#10b981',
      rgb: 'rgb(16, 185, 129)',
      cssVar: '--color-accent-500'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },

  // ============================================================================
  // ASSETS & MEDIA
  // ============================================================================
  
  assets: {
    logo: {
      default: '/assets/logo.svg',
      light: '/assets/logo-light.svg',
      dark: '/assets/logo-dark.svg',
      icon: '/assets/logo-icon.svg',
      wordmark: '/assets/logo-wordmark.svg'
    },
    favicon: {
      ico: '/favicon.ico',
      svg: '/favicon.svg',
      png16: '/favicon-16x16.png',
      png32: '/favicon-32x32.png',
      png192: '/android-chrome-192x192.png',
      png512: '/android-chrome-512x512.png',
      appleTouchIcon: '/apple-touch-icon.png'
    },
    openGraph: {
      default: '/og-image.png',
      twitter: '/twitter-card.png'
    }
  },

  // ============================================================================
  // SEO METADATA
  // ============================================================================
  
  seo: {
    defaultTitle: 'HirePilot AI - Master Your Interview, Land Your Dream Job',
    titleTemplate: '%s | HirePilot AI',
    defaultDescription: 'AI-powered interview preparation platform. Get personalized coaching, practice with real interview questions, and receive instant feedback to ace your next technical or behavioral interview.',
    keywords: [
      'interview preparation',
      'AI interview coach',
      'technical interview practice',
      'behavioral interview',
      'job interview help',
      'interview questions',
      'career coaching',
      'resume review',
      'mock interview',
      'interview feedback'
    ],
    author: 'HirePilot AI Team',
    themeColor: '#7c3aed',
    locale: 'en_US',
    siteName: 'HirePilot AI'
  },

  // ============================================================================
  // OPEN GRAPH METADATA
  // ============================================================================
  
  openGraph: {
    type: 'website',
    siteName: 'HirePilot AI',
    title: 'HirePilot AI - AI-Powered Interview Preparation',
    description: 'Master your interviews with AI-powered coaching, personalized feedback, and comprehensive preparation tools. Land your dream job with confidence.',
    url: 'https://hirepilot.ai',
    image: {
      url: 'https://hirepilot.ai/og-image.png',
      width: 1200,
      height: 630,
      alt: 'HirePilot AI - Interview Preparation Platform'
    },
    locale: 'en_US'
  },

  // ============================================================================
  // TWITTER CARD METADATA
  // ============================================================================
  
  twitter: {
    card: 'summary_large_image',
    site: '@HirePilotAI',
    creator: '@HirePilotAI',
    title: 'HirePilot AI - AI-Powered Interview Preparation',
    description: 'Master your interviews with AI-powered coaching. Get personalized feedback and comprehensive preparation tools.',
    image: 'https://hirepilot.ai/twitter-card.png',
    imageAlt: 'HirePilot AI - Interview Preparation Platform'
  },

  // ============================================================================
  // PAGE-SPECIFIC METADATA
  // ============================================================================
  
  pages: {
    home: {
      title: 'HirePilot AI - Master Your Interview, Land Your Dream Job',
      description: 'AI-powered interview preparation platform. Practice with real questions, get instant feedback, and boost your confidence for technical and behavioral interviews.'
    },
    dashboard: {
      title: 'Dashboard',
      description: 'View your interview preparation progress, track your performance, and access personalized recommendations.'
    },
    interview: {
      title: 'Interview Report',
      description: 'Your personalized interview analysis with strengths, areas for improvement, and actionable recommendations.'
    },
    profile: {
      title: 'Profile',
      description: 'Manage your profile, preferences, and account settings.'
    },
    login: {
      title: 'Sign In',
      description: 'Sign in to your HirePilot AI account to continue your interview preparation journey.'
    },
    register: {
      title: 'Create Account',
      description: 'Create your free HirePilot AI account and start preparing for your dream job interviews.'
    },
    pricing: {
      title: 'Pricing',
      description: 'Choose the plan that fits your interview preparation needs. Start free, upgrade anytime.'
    },
    about: {
      title: 'About Us',
      description: 'Learn about HirePilot AI\'s mission to help job seekers ace interviews and land their dream careers.'
    },
    features: {
      title: 'Features',
      description: 'Explore HirePilot AI\'s powerful features: AI coaching, personalized feedback, practice questions, and more.'
    },
    blog: {
      title: 'Blog',
      description: 'Interview tips, career advice, and industry insights from the HirePilot AI team.'
    },
    support: {
      title: 'Support',
      description: 'Get help with HirePilot AI. Browse FAQs, contact support, or explore our knowledge base.'
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'How HirePilot AI collects, uses, and protects your personal information.'
    },
    terms: {
      title: 'Terms of Service',
      description: 'Terms and conditions for using HirePilot AI services.'
    }
  },

  // ============================================================================
  // FEATURES & VALUE PROPOSITIONS
  // ============================================================================
  
  features: {
    main: [
      {
        id: 'ai-coaching',
        title: 'AI-Powered Coaching',
        description: 'Get personalized interview coaching powered by advanced AI that adapts to your experience level and target role.',
        icon: 'brain'
      },
      {
        id: 'instant-feedback',
        title: 'Instant Feedback',
        description: 'Receive detailed feedback on your answers, including strengths, weaknesses, and specific improvement suggestions.',
        icon: 'zap'
      },
      {
        id: 'real-questions',
        title: 'Real Interview Questions',
        description: 'Practice with actual questions from top companies across technical, behavioral, and situational categories.',
        icon: 'messageSquare'
      },
      {
        id: 'progress-tracking',
        title: 'Progress Tracking',
        description: 'Monitor your improvement over time with detailed analytics and performance metrics.',
        icon: 'trending-up'
      },
      {
        id: 'personalized-plans',
        title: 'Personalized Plans',
        description: 'Get custom preparation roadmaps based on your target role, experience, and skill gaps.',
        icon: 'map'
      },
      {
        id: 'resume-analysis',
        title: 'Resume Analysis',
        description: 'AI-powered resume review with tailored suggestions to match your target job descriptions.',
        icon: 'fileText'
      }
    ]
  },

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  
  navigation: {
    main: [
      { label: 'Dashboard', href: '/dashboard', protected: true },
      { label: 'Features', href: '/features', protected: false },
      { label: 'Pricing', href: '/pricing', protected: false },
      { label: 'Blog', href: '/blog', protected: false }
    ],
    footer: {
      product: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'How it Works', href: '/how-it-works' },
        { label: 'FAQ', href: '/faq' }
      ],
      company: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' }
      ],
      resources: [
        { label: 'Interview Tips', href: '/resources/tips' },
        { label: 'Career Guides', href: '/resources/guides' },
        { label: 'Success Stories', href: '/resources/stories' },
        { label: 'API Documentation', href: '/docs/api' }
      ],
      legal: [
        { label: 'Privacy Policy', href: '/legal/privacy' },
        { label: 'Terms of Service', href: '/legal/terms' },
        { label: 'Cookie Policy', href: '/legal/cookies' },
        { label: 'GDPR', href: '/legal/gdpr' }
      ],
      support: [
        { label: 'Help Center', href: '/support' },
        { label: 'System Status', href: '/status' },
        { label: 'Contact Support', href: '/contact' },
        { label: 'FAQ', href: '/faq' }
      ]
    }
  },

  // ============================================================================
  // EXTERNAL INTEGRATIONS
  // ============================================================================
  
  integrations: {
    analytics: {
      googleAnalyticsId: 'G-XXXXXXXXXX',
      googleTagManagerId: 'GTM-XXXXXXX'
    },
    monitoring: {
      sentryDsn: import.meta.env.VITE_SENTRY_DSN
    },
    support: {
      intercomAppId: import.meta.env.VITE_INTERCOM_APP_ID,
      zendeskUrl: 'https://hirepilot.zendesk.com'
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get full page title with template
 */
export const getPageTitle = (pageTitle) => {
  if (!pageTitle) return BRAND.seo.defaultTitle
  return BRAND.seo.titleTemplate.replace('%s', pageTitle)
}

/**
 * Get page metadata by route key
 */
export const getPageMeta = (pageKey) => {
  return BRAND.pages[pageKey] || {
    title: BRAND.seo.defaultTitle,
    description: BRAND.seo.defaultDescription
  }
}

/**
 * Generate Open Graph meta tags
 */
export const getOpenGraphTags = (customData = {}) => {
  return {
    'og:type': customData.type || BRAND.openGraph.type,
    'og:site_name': BRAND.openGraph.siteName,
    'og:title': customData.title || BRAND.openGraph.title,
    'og:description': customData.description || BRAND.openGraph.description,
    'og:url': customData.url || BRAND.openGraph.url,
    'og:image': customData.image?.url || BRAND.openGraph.image.url,
    'og:image:width': customData.image?.width || BRAND.openGraph.image.width,
    'og:image:height': customData.image?.height || BRAND.openGraph.image.height,
    'og:image:alt': customData.image?.alt || BRAND.openGraph.image.alt,
    'og:locale': BRAND.openGraph.locale
  }
}

/**
 * Generate Twitter Card meta tags
 */
export const getTwitterTags = (customData = {}) => {
  return {
    'twitter:card': BRAND.twitter.card,
    'twitter:site': BRAND.twitter.site,
    'twitter:creator': BRAND.twitter.creator,
    'twitter:title': customData.title || BRAND.twitter.title,
    'twitter:description': customData.description || BRAND.twitter.description,
    'twitter:image': customData.image || BRAND.twitter.image,
    'twitter:image:alt': customData.imageAlt || BRAND.twitter.imageAlt
  }
}

/**
 * Get structured data (JSON-LD) for SEO
 */
export const getStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': BRAND.company.name,
    'url': BRAND.contact.website,
    'logo': `${BRAND.contact.website}${BRAND.assets.logo.default}`,
    'description': BRAND.product.description,
    'email': BRAND.contact.email,
    'foundingDate': BRAND.company.founded,
    'sameAs': Object.values(BRAND.social).map(s => s.url)
  }
}

export default BRAND
