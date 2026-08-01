# HirePilot AI - Brand Foundation Architecture

## Overview

This document describes the centralized brand configuration system implemented for HirePilot AI. This architecture ensures consistent branding across the entire application and enables future rebranding by modifying a single configuration file.

---

## Architecture Principles

### Single Source of Truth
All branding information is defined in one location: `Frontend/src/config/brand.js`

### Component Integration
Components consume brand configuration through the `useBrand()` hook, ensuring no hardcoded values.

### SEO Optimization
Metadata is automatically generated and managed through the `SEO` component.

### Future-Proof
Rebranding requires changes to only one file - `brand.js`

---

## File Structure

```
Frontend/src/
├── config/
│   └── brand.js              # Single source of truth for all branding
├── hooks/
│   └── useBrand.js           # React hook for consuming brand config
├── components/
│   ├── common/
│   │   ├── SEO/
│   │   │   └── SEO.jsx       # Dynamic metadata management
│   │   └── index.js          # Common components export
│   └── layout/
│       ├── Header.jsx        # Updated to use brand config
│       └── Footer.jsx        # Updated with comprehensive branding
├── public/
│   └── site.webmanifest      # PWA manifest with brand info
└── index.html                # Updated with brand-aware meta tags
```

---

## Brand Configuration Contents

### 1. Product Identity
```javascript
product: {
  name: 'HirePilot AI',
  tagline: 'Master Your Interview, Land Your Dream Job',
  description: '...',
  version: '1.0.0'
}
```

### 2. Company Information
```javascript
company: {
  name: 'HirePilot AI Inc.',
  legalName: 'HirePilot AI Incorporated',
  founded: '2026',
  location: 'San Francisco, CA'
}
```

### 3. Contact & Support
```javascript
contact: {
  email: 'hello@hirepilot.ai',
  supportEmail: 'support@hirepilot.ai',
  businessEmail: 'business@hirepilot.ai',
  pressEmail: 'press@hirepilot.ai',
  website: 'https://hirepilot.ai',
  phone: '+1 (555) 123-4567'
}
```

### 4. Social Links
- Twitter
- LinkedIn
- GitHub
- YouTube
- Discord
- Instagram

### 5. Legal & Copyright
- Auto-generated copyright with current year
- Privacy, Terms, Cookie, GDPR policy URLs

### 6. Theme Colors
- Primary: Confident Purple (#7c3aed)
- Secondary: Trust Blue (#3b82f6)
- Accent: Growth Green (#10b981)
- Status colors: Success, Warning, Error, Info

### 7. Assets & Media
- Logo variations (default, light, dark, icon, wordmark)
- Favicon (multiple sizes)
- Open Graph images
- Twitter card images

### 8. SEO Metadata
- Default titles and descriptions
- Keywords
- Author information
- Theme color
- Locale settings

### 9. Open Graph & Twitter
- Structured metadata for social sharing
- Custom images for each platform
- Proper card types

### 10. Page-Specific Metadata
Pre-defined metadata for all major pages:
- Home
- Dashboard
- Interview
- Profile
- Login/Register
- Pricing
- About
- Features
- Blog
- Support
- Privacy/Terms

### 11. Features & Value Props
Array of main features with:
- ID
- Title
- Description
- Icon reference

### 12. Navigation
- Main navigation links
- Footer navigation (5 columns):
  - Product
  - Company
  - Resources
  - Legal
  - Support

---

## Usage Examples

### 1. Using Brand Hook in Components

```jsx
import { useBrand } from '../../hooks/useBrand'

function MyComponent() {
  const brand = useBrand()
  
  return (
    <div>
      <h1>{brand.productName}</h1>
      <p>{brand.tagline}</p>
      <a href={`mailto:${brand.supportEmail}`}>Contact Support</a>
    </div>
  )
}
```

### 2. Adding SEO to Pages

```jsx
import { SEO } from '../../components/common'
import { useBrand } from '../../hooks/useBrand'

function LoginPage() {
  const brand = useBrand()
  
  return (
    <>
      <SEO 
        title={brand.pages.login.title}
        description={brand.pages.login.description}
      />
      <main>
        {/* Page content */}
      </main>
    </>
  )
}
```

### 3. Custom SEO with Image

```jsx
<SEO 
  title="My Custom Page"
  description="Custom description"
  image="https://example.com/custom-og-image.png"
  keywords="custom, keywords"
/>
```

### 4. Accessing Utility Functions

```jsx
const brand = useBrand()

// Get formatted page title
const pageTitle = brand.getPageTitle('Dashboard')
// Result: "Dashboard | HirePilot AI"

// Get page metadata
const loginMeta = brand.getPageMeta('login')
// Result: { title: 'Sign In', description: '...' }

// Get Open Graph tags
const ogTags = brand.getOpenGraphTags({
  title: 'Custom Title',
  image: 'custom-image.png'
})

// Get structured data
const jsonLd = brand.getStructuredData()
```

---

## Utility Functions

### `getPageTitle(pageTitle)`
Formats page title using the template: `%s | HirePilot AI`

### `getPageMeta(pageKey)`
Returns pre-defined metadata for a page by key.

### `getOpenGraphTags(customData)`
Generates Open Graph meta tags with defaults.

### `getTwitterTags(customData)`
Generates Twitter Card meta tags with defaults.

### `getStructuredData()`
Returns JSON-LD structured data for Organization schema.

---

## Component Updates

### Header Component
**Before:**
```jsx
<Link to="/" className="app-header__logo">
  Interview<span className="highlight">AI</span>
</Link>
```

**After:**
```jsx
import { useBrand } from '../../hooks/useBrand'

const brand = useBrand()
<Link to="/" className="app-header__logo">
  {brand.productName}
</Link>
```

### Footer Component
**Before:**
- Hardcoded "InterviewAI" text
- Limited footer links
- Hardcoded copyright
- Hardcoded email

**After:**
- Dynamic product name from brand config
- Comprehensive 5-column footer with all navigation
- Auto-generated copyright with current year
- Dynamic social links with icons
- All content sourced from brand config

### Authentication Pages
**Before:**
```jsx
<h1>Login</h1>
```

**After:**
```jsx
<SEO 
  title={brand.pages.login.title}
  description={brand.pages.login.description}
/>
<h1>Sign In to {brand.productName}</h1>
<p className="form-subtitle">{brand.tagline}</p>
```

---

## SEO Component Features

### Automatic Meta Tag Management
- Sets document title
- Updates description
- Manages keywords
- Sets theme color
- Handles robots/noindex

### Open Graph Tags
- Automatic generation from config
- Custom overrides supported
- Proper image dimensions
- Social platform optimized

### Twitter Card Tags
- Summary large image card type
- Proper site/creator attribution
- Custom overrides

### Canonical URLs
- Automatically set to current URL
- Custom URLs supported

### Structured Data (JSON-LD)
- Organization schema
- Automatic generation
- Custom structured data support

---

## Future Rebranding Process

To rebrand the entire application:

1. **Update Brand Config**
   - Modify `Frontend/src/config/brand.js`
   - Change product name, tagline, colors, URLs, etc.

2. **Update Assets**
   - Replace logo files in `public/assets/`
   - Replace favicon files in `public/`
   - Replace Open Graph images

3. **Update Design Tokens (if needed)**
   - Modify color tokens in `design-tokens.scss`
   - Brand config references CSS variables

4. **Build & Deploy**
   - All components automatically use new branding
   - No code changes required

---

## Integration with Design System

### Color Tokens
Brand colors are mapped to CSS custom properties:
```javascript
theme: {
  primary: {
    name: 'Confident Purple',
    hex: '#7c3aed',
    cssVar: '--color-primary-600'  // Links to design token
  }
}
```

### Component Consistency
All UI components use design tokens that align with brand colors:
- Buttons use `var(--color-primary-600)`
- Links use `var(--color-primary-600)`
- Brand elements consistently styled

---

## Environment Variables

For sensitive or environment-specific branding:

```javascript
integrations: {
  monitoring: {
    sentryDsn: process.env.VITE_SENTRY_DSN
  },
  support: {
    intercomAppId: process.env.VITE_INTERCOM_APP_ID
  }
}
```

---

## Best Practices

### DO:
✅ Always use `useBrand()` hook to access brand config
✅ Add `<SEO>` component to every public page
✅ Use brand utility functions for metadata
✅ Keep brand config as single source of truth
✅ Update brand config instead of hardcoding values

### DON'T:
❌ Hardcode product names in components
❌ Hardcode URLs or emails in components
❌ Skip SEO component on public pages
❌ Create multiple brand configuration files
❌ Bypass brand config for "quick fixes"

---

## Testing Branding

### Visual Test
1. Update `brand.productName` to "TestBrand AI"
2. Reload application
3. Verify Header, Footer, Login, Register show "TestBrand AI"

### SEO Test
1. View page source
2. Check `<title>` tag
3. Verify Open Graph tags
4. Verify Twitter Card tags
5. Check JSON-LD structured data

### Theme Test
1. Toggle light/dark mode
2. Verify theme color changes
3. Check meta tags update

---

## Benefits

✅ **Consistency**: All branding from one source
✅ **Maintainability**: Update once, change everywhere
✅ **SEO**: Proper metadata management
✅ **Social Sharing**: Optimized Open Graph and Twitter Cards
✅ **Future-Proof**: Easy rebranding process
✅ **Type Safety**: Clear structure and documentation
✅ **Developer Experience**: Simple `useBrand()` hook
✅ **Performance**: Memoized brand configuration

---

## Version History

**v1.0.0** (August 2026)
- Initial brand foundation implementation
- SEO component created
- Header and Footer updated
- Authentication pages updated
- Documentation completed

---

**Last Updated**: August 1, 2026
**Maintained By**: HirePilot AI Team
