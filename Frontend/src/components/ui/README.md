# HirePilot AI Design System

## Overview

The HirePilot AI Design System is a comprehensive, production-ready component library and design token system built for the HirePilot AI platform. It ensures visual consistency, accessibility, and maintainability across the entire application.

## Design Philosophy

- **Minimal & Elegant**: Clean interfaces with purposeful design decisions
- **Accessible by Default**: WCAG 2.1 AA compliant
- **Performance First**: Optimized animations and reduced motion support
- **Dark Mode Native**: Designed for dark mode with light mode support
- **Token-Based**: All values reference design tokens for easy theming

## Core Principles

1. **Consistency**: Every component follows the same patterns
2. **Flexibility**: Components are composable and customizable
3. **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
4. **Responsiveness**: Mobile-first design with proper breakpoints
5. **Performance**: Smooth animations with reduced motion support

---

## Design Tokens

### Colors

#### Brand Colors
- **Primary**: `--color-primary-600` (#7C3AED) - Purple, represents intelligence
- **Secondary**: `--color-secondary-500` (#3B82F6) - Blue, represents trust
- **Accent**: `--color-accent-500` (#10B981) - Green, represents growth

#### Semantic Colors
- **Background**: `--color-bg` - Main app background
- **Surface**: `--color-surface` - Cards, panels
- **Border**: `--color-border` - Default borders
- **Text Primary**: `--color-text-primary` - Main content
- **Text Secondary**: `--color-text-secondary` - Supporting text

#### Status Colors
- **Success**: `--color-success` (#10B981)
- **Warning**: `--color-warning` (#F59E0B)
- **Error**: `--color-error` (#EF4444)
- **Info**: `--color-info` (#3B82F6)

### Typography

- **Font Family**: Inter Variable (application), Cal Sans (marketing)
- **Font Sizes**: `--font-size-xs` (12px) through `--font-size-6xl` (60px)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: `--line-height-tight` (1.25) through `--line-height-loose` (2)

### Spacing

Based on 4px base unit:
- `--space-1` = 4px
- `--space-2` = 8px
- `--space-4` = 16px
- `--space-6` = 24px
- `--space-8` = 32px
- Up to `--space-32` = 128px

### Radius

- `--radius-sm` = 6px - Small elements
- `--radius-md` = 8px - Default (buttons, inputs)
- `--radius-lg` = 12px - Cards
- `--radius-xl` = 16px - Modals
- `--radius-full` = 9999px - Circles, pills

### Shadows

- `--shadow-sm` - Subtle lift
- `--shadow-md` - Cards, dropdowns
- `--shadow-lg` - Modals
- `--shadow-xl` - Overlays
- `--shadow-primary` - Brand colored shadow

### Motion

- **Durations**: `--duration-fast` (150ms) through `--duration-slower` (600ms)
- **Easing**: `--ease-out`, `--ease-in`, `--ease-in-out`
- **Reduced Motion**: Automatically disabled via media query

---

## Components

### Button

Production-ready button with multiple variants and states.

```jsx
import { Button } from '@/components/ui'

// Primary button
<Button variant="primary" size="md">
  Click Me
</Button>

// With icon
<Button 
  variant="secondary" 
  leftIcon={<Icon />}
  onClick={handleClick}
>
  Save Changes
</Button>

// Loading state
<Button loading={true}>
  Processing...
</Button>
```

**Variants**: `primary`, `secondary`, `tertiary`, `destructive`, `ghost`
**Sizes**: `sm`, `md`, `lg`
**States**: `loading`, `disabled`

---

### Input

Flexible input component with validation states.

```jsx
import { Input } from '@/components/ui'

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
  required
/>
```

**Features**:
- Label and helper text
- Error states with messages
- Left/right icons
- Character count
- Required indicator
- Size variants

---

### Card

Flexible card container with composable parts.

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Interview Report</CardTitle>
    <CardDescription>Generated on Jan 15, 2026</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your match score is 87%</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Variants**: `default`, `elevated`, `flat`
**Options**: `hoverable`, `clickable`

---

### Modal

Accessible modal dialog with backdrop.

```jsx
import { Modal } from '@/components/ui'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this interview?</p>
</Modal>
```

**Features**:
- Escape key closes
- Click outside to close (optional)
- Focus trap
- Smooth animations
- Mobile responsive (slides up from bottom)

---

### Skeleton

Loading placeholder components.

```jsx
import { Skeleton, SkeletonCard } from '@/components/ui'

// Basic skeleton
<Skeleton width="200px" height="24px" />

// Pre-built card skeleton
<SkeletonCard height="300px" />
```

**Variants**: `rectangular`, `circular`, `rounded`

---

### EmptyState

Placeholder when no data exists.

```jsx
import { EmptyState } from '@/components/ui'

<EmptyState
  icon={<InboxIcon />}
  title="No interviews yet"
  description="Get started by creating your first interview preparation plan."
  action={
    <Button onClick={handleCreate}>
      Create Interview
    </Button>
  }
/>
```

---

## Usage Guidelines

### Importing Components

```jsx
// Import individual components
import { Button, Input, Card } from '@/components/ui'

// Or import specific component
import Button from '@/components/ui/Button/Button'
```

### Using Design Tokens

```scss
// In SCSS files
.custom-component {
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}
```

```jsx
// In inline styles
<div style={{ padding: 'var(--space-4)' }}>
  Content
</div>
```

### Dark/Light Mode

Theme is controlled by `data-theme` attribute:

```jsx
// Toggle theme
document.documentElement.dataset.theme = 'light' // or 'dark'
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Enter, Space, Escape, Arrows)
- ✅ Focus indicators visible
- ✅ ARIA labels and roles
- ✅ Color contrast ≥ 4.5:1 for text
- ✅ Screen reader support
- ✅ Reduced motion support
- ✅ Touch targets ≥ 44px

### Testing Accessibility

```bash
# Run with screen reader
# Test keyboard navigation
# Verify color contrast
# Test at 200% zoom
```

---

## Responsive Breakpoints

```scss
// Mobile: < 768px
// Tablet: 768px - 1023px
// Desktop: ≥ 1024px

@media (max-width: 767px) {
  // Mobile styles
}

@media (min-width: 768px) {
  // Tablet and up
}

@media (min-width: 1024px) {
  // Desktop and up
}
```

---

## Migration Guide

### Updating Existing Components

1. **Replace hardcoded colors**:
```scss
// Before
color: #e1034d;

// After
color: var(--color-primary-600);
```

2. **Use spacing tokens**:
```scss
// Before
padding: 16px;

// After
padding: var(--space-4);
```

3. **Apply consistent border radius**:
```scss
// Before
border-radius: 8px;

// After
border-radius: var(--radius-md);
```

---

## Future Roadmap

- [ ] Tabs component
- [ ] Dropdown/Select component
- [ ] Table component
- [ ] Badge component
- [ ] Avatar component
- [ ] Tooltip component
- [ ] Alert/Banner component
- [ ] Pagination component

---

## Support

For questions or issues with the design system:
- Check the Product Bible document
- Review component examples
- Contact the design system maintainer

---

**Version**: 1.0
**Last Updated**: January 2026
**Maintained by**: HirePilot AI Team
