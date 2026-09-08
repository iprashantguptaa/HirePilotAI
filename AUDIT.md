# HirePilot AI — Full App Audit

Four parallel static audits (backend API/security, frontend logic, design system,
accessibility/copy) plus a live click-through of the running app.

**Raw findings: 306. After dedup and verification: 247 real, 4 ruled out.**
**Fix pass (this session): all P0 items and the user-facing P1 items below are `[x]`.**

Status: `[ ]` open · `[x]` fixed · `[~]` needs your decision

Evidence tags:
- **LIVE** — reproduced in the running app (Chrome, real generated report)
- **MEASURED** — numeric proof (contrast ratio / computed style)
- **STATIC** — found by reading code, not exercised at runtime

Test setup: account `audituser`, real plan generated from a "Senior MERN Stack
Developer" JD (match 55%), so every screen was checked against real AI output.

---

# Ruled out — do not act on these

Reported by the audits but **verified false**. Recorded so they don't get "fixed".

1. **"`priorityActions.js` is missing, Interview page cannot load."** The file
   exists at `Frontend/src/features/interview/utils/priorityActions.js` and the
   Results Hub renders priority actions live. Reported as CRITICAL; it is not.
2. **"`.ir-next .ir-btn--ghost` has 1.1:1 contrast in light mode."** Real CSS,
   but `.ir-next` appears in **no JSX file** — it is dead CSS, not a live bug.
   Reclassified to the dead-code section.
3. **"Orphaned `AppSidebar` styles remain."** None found; the removal was clean.
4. **"No `console.log` left in the frontend."** Correct — nothing to do.

---

# P0 — Broken for users right now

### 1. `[x]` Flash of the logged-out marketing navbar on every hard page load
**LIVE.** `components/layout/Header.jsx:119`

`Header` branches on `user`, which is `null` while the session bootstraps, so a
logged-in user refreshing any page sees the visitor navbar ("Log in",
"Get Started →") for ~300–800ms. Captured in screenshots on `/interview/new`
and on the 404 page.

Fix: read `bootstrapping` from `useAuth()` and render a neutral nav until the
session resolves.

### 2. `[x]` Skill-gap filter matches every question (stopwords are match tokens)
**LIVE.** `features/interview/utils/priorityActions.js:78-90`

`gapTokens()` keeps every word of length >= 2, so "System Design for Scale"
yields the token `for`, which occurs in almost every question. Clicking that gap
reported "5 technical and 4 behavioral matches" — the entire question bank. The
feature looks functional but filters nothing.

Fix: stopword list + minimum token length 3, keep the full phrase as a
high-weight match.

### 3. `[x]` Suspended accounts can still log in
**STATIC.** `Backend/src/controllers/auth.controller.js:198-218, 290-296, 332-343`

`authUser` middleware checks `isActive` on every request, but
`loginUserController`, `verifyLoginOtpController` and `refreshTokenController`
never do — so a suspended user can mint a fresh session through login, OTP, or
refresh. Admin "Suspend" is therefore only partially effective.

Fix: reject with 403 when `!user.isActive` in all three controllers before
`issueSession`.

### 4. `[x]` Password-reset OTP is returned in the API response
**STATIC.** `Backend/src/controllers/auth.controller.js:428-431`

When SMTP is unconfigured, `forgotPasswordController` returns `previewOtp` in
the JSON body. Anyone who knows an email address can request the reset and read
the OTP straight from the response — full account takeover.

Fix: never return OTP values; gate the preview behind a non-production flag or
remove it.

### 5. `[x]` Login silently drops OTP when SMTP is not configured
**STATIC.** `Backend/src/controllers/auth.controller.js:210-218`

If `SMTP_HOST` is unset, login skips the OTP step and issues a full session.
A mail misconfiguration in production disables the second factor with no signal.

Fix: fail closed in production (503) instead of bypassing.

### 6. `[x]` `NODE_ENV` defaults to development
**STATIC.** `Backend/src/config/env.js:50-51`

If the host doesn't set `NODE_ENV`, cookies ship with `secure: false` and
`sameSite: "lax"`, which both weakens cookie security and breaks cross-origin
auth on the deployed split frontend/backend.

Fix: require `NODE_ENV=production` in `validateEnv()` for production deploys.

### 7. `[x]` `FRONTEND_URL` defaults to localhost
**STATIC.** `Backend/src/config/env.js:71`

Verification and reset emails link to `http://localhost:5173` if the env var is
missing in production.

Fix: require `FRONTEND_URL` at startup in production.

### 8. `[x]` AI-generated HTML goes straight into Puppeteer
**STATIC.** `Backend/src/services/ai.service.js:326-348`

Resume HTML from the model is passed to `page.setContent` unsanitized with
JavaScript enabled, and `browser.close()` is not in a `finally`. Malicious or
malformed model output can execute in headless Chrome and leak browser
processes on every failure.

Fix: sanitize the HTML, disable JS and network in the page, wrap in try/finally.

### 9. `[x]` Expensive AI endpoints have no rate limit or cost cap
**STATIC.** `Backend/src/routes/interview.routes.js:15`,
`Backend/src/routes/session.routes.js:12-40`, `services/ai.service.js`

Report generation and per-answer scoring sit behind only the global 300/15min
limiter, with no per-user AI budget. One authenticated account can exhaust the
Gemini quota and run up the bill.

Fix: dedicated per-user limiters (e.g. 5 reports/hour) plus a daily token budget
checked before each call.

### 10. `[x]` Gemini calls have no timeout
**STATIC.** `Backend/src/services/ai.service.js:72-107`

No `AbortSignal`, so a hung upstream call holds the request open indefinitely.

Fix: 60–90s abort timeout on every `generateContent`.

### 11. `[x]` Score-breakdown percentages are invisible in dark mode
**MEASURED.** `features/interview/style/interview.scss:262`

`.metric-row__value` uses `--color-primary-800`; measured contrast on the dark
background is **1.32:1** (AA needs 4.5:1).

Root cause is systemic — see #12.

### 12. `[x]` Dark theme only overrides 4 of the 11 primary token steps
**MEASURED.** `styles/design-tokens.scss:221-225`

The dark block redefines `--color-primary-400` through `-700` only.
`--color-primary-50/100/200/800/900/950` keep their **light-theme** values in
dark mode. Anything using them renders as dark-on-dark or washed-out, which is
the actual cause of #11 and of the "dull" dark mode reported earlier.
Affected: `home.scss:141-143`, `dashboard.scss:375-377`, interview severity
labels, and more.

Fix: extend the dark block to the full primary scale.

### 13. `[x]` Old slate palette still hardcoded in the score meters
**MEASURED.** `features/interview/style/interview.scss:269, 282`

Track is `#e2e8f0` (light) / `#243044` (dark) — computed live as
`rgb(36, 48, 68)`, a blue-navy bar inside a forest-green page.

### 14. `[x]` `<Link><Button/></Link>` emits nested interactive controls
**LIVE.** 16 occurrences.

`Button` always renders a `<button>` (`components/ui/Button/Button.jsx:33`), so
wrapping it in `Link` produces `<a><button>` — invalid HTML and an axe
`nested-interactive` failure. The accessibility tree confirms two controls per
instance (`link "New Interview"` **and** `button "New Interview"`).

Files: `Dashboard.jsx:133,178,205,207,239,243,247,252` ·
`InterviewHistory.jsx:40,93` · `PracticeSetup.jsx:213` ·
`PracticeSession.jsx:71` · `SessionReport.jsx:150,154` ·
`VerifyEmail.jsx:68,85,90` · `NotFound.jsx:31,40`

Fix: add a polymorphic `as` prop to `Button`, use `<Button as={Link} to="…">`.

### 15. `[x]` Form inputs have no label association anywhere in the app
**STATIC.** `components/ui/Input/Input.jsx:43-47`,
`components/ui/Textarea/Textarea.jsx:45-49`

Neither primitive pairs `htmlFor` with an input `id`, and errors are rendered
without `aria-describedby` / `aria-invalid`. Because every form in the product
uses these two components, this fails axe `label` on **every** form page —
login, register, profile, interview setup, practice, feedback.

Fix: `useId()`-based id/htmlFor pairing plus `aria-invalid` and
`aria-describedby` wiring in both primitives. Single fix, app-wide payoff.

### 16. `[x]` Failed fetches leave users on permanent loading screens
**STATIC.** 6 pages.

The pattern `if (loading || !data)` renders the loading state forever when the
request fails, because `loading` goes false while `data` stays null. No error,
no retry, no way out except a manual reload. Worse on `Interview.jsx`, which
also keeps `aria-busy="true"` set.

- `features/interview/pages/Interview.jsx:397-404`
- `features/profile/pages/Profile.jsx:39-45` (+ `hooks/useProfile.js:15-24`)
- `features/admin/pages/AdminAiUsage.jsx:35-50`
- `features/admin/pages/AdminDashboard.jsx:42-46` — worse: dereferences
  `stats.totalUsers` on null and crashes
- `features/dashboard/pages/Dashboard.jsx` and `InterviewHistory.jsx` — fail
  *silently* into the "No interviews yet" empty state, so a returning user is
  told they have no data when the API is simply down

Fix: track an error state separately from loading and render a retry panel.

### 17. `[x]` Roadmap progress and bookmarks leak between users on a shared browser
**STATIC.** `features/interview/pages/Interview.jsx:286-329`

Keys are `hp_roadmap_${interviewId}` / `hp_bookmarks_${interviewId}` with no
user namespace. Two accounts on one browser read each other's checkboxes.

Fix: prefix with the user id.

### 18. `[x]` Account deletion leaves most user data behind
**STATIC.** `Backend/src/controllers/profile.controller.js:257-262`,
`Backend/src/controllers/admin.controller.js:149-154`

Deletes reports, chats and refresh tokens, but not `InterviewSession`,
`AiUsageLog`, `Feedback`, or blacklisted tokens. A GDPR-relevant gap given the
product ships a GDPR footer link.

Fix: cascade across every user-linked collection in both delete paths.

---

# P1 — Wrong behaviour, dead ends, misleading UI

### 19. `[x]` "View History" button goes to the dashboard
**LIVE.** `pages/NotFound.jsx:40-43` — label says View History, `to="/dashboard"`.
Also offers a protected route to logged-out visitors.

### 20. `[x]` "Go to dashboard" goes to the landing page
**STATIC.** `features/auth/pages/VerifyEmail.jsx:47-48, 69-70, 91-92` —
copy says dashboard, `Link to="/"`. Line 85 links to `/profile`, which bounces
unauthenticated users into a login loop.

### 21. `[ ]` Footer "How it Works" renders a "Page not found" body
**STATIC.** `config/brand.js:302` → `/how-it-works` → `MarketingPage`, but
`content.js` has no `how-it-works` key, so the route resolves and then renders
the component's internal not-found branch. Route exists; content doesn't.

### 22. `[x]` Footer links visitors to `/feedback`, which requires auth
**STATIC.** `config/brand.js:323-327`, `Footer.jsx:37-38`. Same on
`NotFound.jsx:49` ("Contact support" → `/feedback`).

### 23. `[x]` Logged-in users can still open `/login` and `/register`
**STATIC.** No redirect on `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`,
`ResetPassword.jsx`.

### 24. `[x]` Post-login return URL is lost
**STATIC.** `features/auth/components/Protected.jsx:18-19` — `<Navigate to="/login" />`
with no `state={{ from }}` and no `replace`, so users land on the dashboard
instead of the page they wanted, and the redirect pollutes history.

### 25. `[x]` Dashboard and admin show hardcoded fake analytics
**STATIC.** `Dashboard.jsx:266` and `AdminDashboard.jsx:96` both pass
`trend={{ value: 12, isPositive: true }}` — an invented "+12%" shown as real data.

### 26. `[x]` Landing page advertises features that don't exist
**STATIC.** `pages/Landing.jsx:54, 97, 185-186`

A "Recording" indicator in the interview mock and "Upload your PDF or DOCX
resume" / "AI interviewer trained on your resume", while the product is
text-only practice and the uploader accepts PDF only (`Home.jsx` says
"PDF (Max 5MB)"). The FAQ in `content.js` explicitly says camera/voice are not
available.

### 27. `[ ]` `GET /session/:id` mutates state and races
**STATIC.** `Backend/src/controllers/session.controller.js:375-389`

A GET generates AI questions and backfills narrative. Two concurrent GETs both
call `appendNextQuestion` and create duplicate turns; a polling client burns AI
credits. Same race on the answer endpoint (lines 277-307).

Fix: make GET read-only, move generation to POST, claim the pending turn with an
atomic `findOneAndUpdate`.

### 28. `[x]` Profile edits to skills/experience/education are silently discarded
**STATIC.** `features/profile/pages/Profile.jsx:119-217`

Those sections mutate `form` state, but only the About block has a submit
button, so a user edits their experience, navigates away, and loses it.

### 29. `[x]` Account deletion doesn't clear the local session
**STATIC.** `features/profile/pages/Profile.jsx:69-73` — navigates to `/login`
without `handleLogout()`, leaving stale tokens in `sessionStorage`.

### 30. `[x]` Multipart uploads set their own Content-Type
**STATIC.** `features/profile/services/profile.api.js:21-22, 35-36` — manually
setting `multipart/form-data` strips the boundary and breaks the upload. The
same bug is already documented as fixed in `interview.api.js:19-20`.

### 31. `[x]` `startSession` navigates without checking the response
**STATIC.** `features/practice/pages/PracticeSetup.jsx:114-116` — uses
`response.session._id` unguarded.

### 32. `[x]` No error boundary anywhere
**STATIC.** `app.routes.jsx`, `App.jsx:15`, `main.jsx:6-9` — no `errorElement`,
no React error boundary, so any render error shows the raw React Router error
screen. That is exactly how the `loading is not defined` crash surfaced earlier
this session.

### 33. `[ ]` No CSRF protection with `SameSite=None` cookies
**STATIC.** `Backend/src/controllers/auth.controller.js:39-46`

Production cookies use `sameSite: "none"` so the browser sends them
cross-site, and there is no CSRF token or custom-header requirement on mutating
routes. Logout is additionally exposed over unauthenticated **GET**
(`auth.routes.js:54`), so a third-party page can force-logout a user.

### 34. `[ ]` Tokens are returned in JSON response bodies
**STATIC.** `auth.controller.js:175-179, 213-218, 292-296, 343` — defeats the
purpose of the httpOnly cookies they are issued alongside; any XSS can read them.

### 35. `[ ]` Admin search builds unescaped regex from user input
**STATIC.** `Backend/src/controllers/admin.controller.js:72-73, 175` —
`new RegExp(search, "i")` allows ReDoS.

### 36. `[x]` Resume upload accepts any file type
**STATIC.** `Backend/src/middlewares/file.middleware.js:4-9` — 3MB cap but no
MIME filter, while the UI promises PDF. Avatar upload
(`avatarUpload.middleware.js:11-15`) trusts the client-declared MIME.

### 37. `[ ]` Token blacklist has no index and no TTL
**STATIC.** `Backend/src/models/blacklist.model.js:4-11` — every authenticated
request runs an unindexed `findOne`, and the collection grows forever.

### 38. `[ ]` No length caps on AI-bound user input
**STATIC.** `interview.controller.js:49-53`, `session.controller.js:204-208` —
`jobDescription`, `selfDescription` and `title` reach the model and the DB
uncapped.

### 39. `[ ]` Model scores aren't range-validated
**STATIC.** `Backend/src/services/ai.service.js:216-233` — Zod schemas lack
`.min(0).max(100)`, so an out-of-range `matchScore` is stored and rendered.

### 40. `[ ]` Chat input is injected into prompts unsandboxed
**STATIC.** `ai.service.js:394-428`, `chat.controller.js:96-102` — no
delimiters or untrusted-content instruction, so prompt injection can override
the system prompt.

### 41. `[ ]` Missing indexes and constraints
**STATIC.** `interviewReport.model.js:111-114` (`user` not required, not
indexed — and it's the field every query filters on) ·
`feedback.model.js:4-7` (no index on `user`) ·
`chatConversation.model.js:33-34` (unbounded `messages` array)

### 42. `[x]` First-run dashboard shows two competing empty states
**LIVE.** `Dashboard.jsx:152-185` — the 3-step guide *and* a nested
`EmptyState` "No interviews yet", leaving a large dead gap in the card.

### 43. `[x]` Modal has no focus trap; mobile menu has no keyboard handling
**STATIC.** `components/ui/Modal/Modal.jsx:21-105` (Tab escapes to background
content) · `Header.jsx:184-192` (no Escape, no focus trap, no focus return)

---

# P2 — Design system and dark mode

### 44. `[ ]` Purple and teal focus rings from the retired palette — 10 files
**STATIC.** The old `rgba(124, 58, 237, …)` purple and `rgba(15, 118, 110, …)`
teal are still the focus colour on most inputs:

`Input.scss:161,180` · `Textarea.scss:60,99,113` · `auth.form.scss:84` ·
`profile.scss:240` · `feedback.scss:101,200` · `history.scss:68` ·
`ChatPanel.scss:122` · `mixins.scss:185,328` · `utilities.scss:284` ·
`animations.scss:165-168,286`

Fix: one pass replacing all with `color-mix(in srgb, var(--color-border-focus) 25%, transparent)`.

### 45. `[ ]` Old red/amber/purple/blue literals in components
**STATIC.** `Button.scss:122-124,128` and `style/button.scss:80-82` (old
`#dc2626`/`#b91c1c`) · `Badge.scss:45-47,75-77` (purple + blue washes) ·
`StatCard.scss:32` (purple) · `tokens.scss:99-107` (legacy `#dc2626`,
`#d97706`, `#fca5a5`, `#fbbf24`) · `NotFound.scss:13,69` (purple 404 glow) ·
`design-tokens.scss:149-152` (the `--shadow-primary/success/warning/error`
tokens themselves still embed old teal/amber/red)

### 46. `[ ]` Auth brand panel uses slate literals and has failing contrast
**MEASURED.** `AuthLayout.scss:84,91,115-119,137-147` — `#f8fafc`, `#94a3b8`,
`#e2e8f0` slate literals, and `.auth-feature__value/__label` put
`--color-text-primary` (dark) on a dark glass card at roughly **2:1**.
Visible in the register-page screenshot as three unreadable stat rows.

### 47. `[ ]` `outline: none` without a `:focus-visible` replacement — 12 places
**STATIC.** `Input.scss:62` · `Textarea.scss:47` · `auth.form.scss:82` ·
`history.scss:66` · `feedback.scss:99` · `ChatPanel.scss:120` ·
`profile.scss:238` · `admin.scss:209` · `mixins.scss:183` ·
`utilities.scss:283` · `base.scss:188,208` (global button/input)

The global `:focus-visible` in `base.scss:255-258` is overridden by these, so
keyboard users lose the focus ring on nearly every control.

### 48. `[ ]` Text below the 12px floor — 13 places
**MEASURED.** `.ir-gap__sev` computes to **10.4px** live. Also
`interview.scss:91,455,548,613,735,870,901,1144` (`0.65rem`) ·
`home.scss:93,168` · `Landing.scss:10,188,285,303,367` (down to `0.68rem`)

### 49. `[ ]` `--color-info` is sky blue in a forest/brass palette
**STATIC.** `design-tokens.scss:76-78` (`#0284c7`), and `tokens.scss:109-110`
aliases info to slate — two different hues for one semantic. Used by Badge,
Alert, SkillGapChart and toasts.

### 50. `[ ]` Two parallel button systems
**STATIC.** `style/button.scss` (`.button.primary-button`) vs
`components/ui/Button/Button.scss` (`.hp-button--*`), with divergent danger
colours. Both ship.

### 51. `[ ]` Duplicated keyframes and utilities
**STATIC.** `utilities.scss:62-172` vs `animations.scss:189-227` duplicate
`fadeIn`/`slideInUp` and `.animate-fade-in`/`.hover-lift`/`.hover-scale`/
`.hover-glow`. `.sr-only` is defined twice (`base.scss:300-310`,
`utilities.scss:394-404`). `pageSlideIn` overlaps `slideInUp`.

### 52. `[ ]` Z-index stack has no token discipline
**STATIC.** `.skip-link` 9999 (`utilities.scss:415`), toast 1100
(`toast.scss:9`), while tokens define modal 1050 / sticky 1020 / dropdown 1000.
Toast currently paints above the modal.

### 53. `[ ]` Raw values instead of tokens
**STATIC.** Radius (`0.4rem`, `2px`, `0.55rem`, `99px`, `999px`), shadows,
durations (`160ms`, `280ms`, `500ms`, `700ms`, `800ms`, `1s`, `8s`), and
spacing (`0.85rem`, `1.15rem`) are used raw across interview, landing, chat,
dashboard and history styles.

### 54. `[ ]` Inconsistent breakpoints
**STATIC.** `admin.scss` 800px · `Landing.scss` 900px · `dashboard.scss` 720px ·
`interview.scss` 1100px and 720px — none match the 640/768/1024/1280 tokens.

### 55. `[ ]` Layouts that overflow on small phones
**STATIC.** `auth.form.scss:16-17` (`min-width: 350px` overflows below ~382px) ·
`history.scss:74,78` (`min-width: 220px`/`160px` filters) ·
`EmptyState.scss:14` (fixed `min-height: 400px`)

### 56. `[ ]` Animations without `prefers-reduced-motion` guards
**STATIC.** `ChatPanel.scss:86-94` (infinite typing dots) ·
`toast.scss:33` · `.motion-crossfade` (`interview.scss:1235`) is missing from
the existing reduced-motion block at 1174.

### 57. `[ ]` Dead CSS for deleted components
**STATIC.** Verified against every JSX file — none of these class names appear
anywhere: `.ir-next` (`interview.scss:315-356`, incl. the invisible ghost
button), `.ir-aside` (`593-634`), `.ir-hub__hero` and friends (`986-1021`),
`.lp-footer` (`Landing.scss:19`), `.auth-layout__mesh` + `meshFloat`/
`meshRotate` keyframes (`AuthLayout.scss:95-97,155-174`), and `.glass`,
`.focus-ring`, `.hover-glow`, `.gradient-mesh` in `utilities.scss`.

---

# P3 — Accessibility

### 58. `[ ]` Placeholder-only inputs (no label) — 8 places
**STATIC.** `ExperienceEditor.jsx:17-47` (6 fields) ·
`EducationEditor.jsx:17-38` (5 fields) · `SkillsInput.jsx:38-45` ·
`ChatPanel.jsx:59-66` · `InterviewHistory.jsx:53-58` ·
`AdminUsers.jsx:78-82` · `AdminInterviews.jsx:56-60` ·
`Home.jsx:105-116` (job description textarea has only a nearby `<h2>`)

### 59. `[ ]` Unlabelled `<select>` elements
**STATIC.** `InterviewHistory.jsx:60-68` · `AdminFeedback.jsx:52-56` ·
`PracticeSetup.jsx:199-207` (label present but no `htmlFor`/`id`) ·
`AdminFeatureFlags.jsx:71-73`

### 60. `[x]` Icon-only button with no accessible name
**STATIC.** `features/profile/pages/Profile.jsx:251` — remove-resume button is
an SVG only.

### 61. `[ ]` Missing tab/panel wiring
**STATIC.** `PracticeSetup.jsx:174-193` and `components/ui/Tabs/Tabs.jsx:69-90`
have `role="tab"` and `aria-selected` but no `aria-controls`/`id`/`role="tabpanel"`.

### 62. `[ ]` State not exposed on toggles
**STATIC.** `Interview.jsx:727-728,778-779` ("Expand all"/"Collapse all" lack
`aria-pressed`) · `Feedback.jsx:72-83` (category buttons act as radios with no
`role="radiogroup"`/`aria-checked`) · `Feedback.jsx:114-120` (star rating
`aria-label` doesn't convey selection)

### 63. `[ ]` Async status not announced
**STATIC.** `ChatPanel.jsx:44-45` ("Loading conversation...") and `:55` (typing
indicator) have no `aria-live`.

### 64. `[ ]` Charts have no text alternative
**STATIC.** `TrendChart.jsx:62-140` (no `role="img"`/`aria-label`) ·
`SkillGapChart.jsx:67-71` (bars are plain divs; need `role="meter"`)

### 65. `[x]` No skip link
**STATIC.** `AppLayout.jsx` — fails the bypass-blocks criterion. (A `.skip-link`
style exists in `utilities.scss` but nothing renders it.)

### 66. `[ ]` Decorative SVGs not hidden from assistive tech — ~30 places
**STATIC.** `Profile.jsx` (12 instances) · all six `features/admin/pages/*` page
headings · `Header.jsx:8-30` · `Logo.jsx:20-52` · `FileUpload.jsx:106-131` ·
`Feedback.jsx:64-68,88-90,107-109`

### 67. `[ ]` Heading order problems
**STATIC.** `Home.jsx:66-79` (loading `<h2>` with no `<h1>`) ·
`Footer.jsx:24-46` (`<h4>` after `<h2>`) · `AuthLayout.jsx:32` (a second
top-level heading beside the form `<h1>`) · `SessionReport.jsx:126-137`
(`<h2>` → `<h4>`) · `EmptyState.jsx:25` (fixed `<h3>` regardless of context)

### 68. `[ ]` Admin nav has no accessible name
**STATIC.** `features/admin/components/AdminLayout.jsx:19`

### 69. `[ ]` Unstyled route-guard loading in admin
**STATIC.** `features/admin/components/AdminProtected.jsx:7-8` — bare
`<h1>Loading...</h1>`; the shared `.route-guard` component now exists and
should be reused.

### 70. `[ ]` Index keys on editable lists
**STATIC.** `ExperienceEditor.jsx:15`, `EducationEditor.jsx:15`,
`ChatPanel.jsx:49-52` — removing or reordering an entry reuses the wrong
component state.

---

# P4 — Copy and SEO

### 71. `[x]` Page titles are stale or missing on 18 routes
**LIVE.** `/dashboard` still read `Create Account | HirePilot AI` after
registering; `/interview/new`, the report page and the 404 all showed the
generic `index.html` fallback.

No `SEO` component: `Dashboard`, `InterviewHistory`, `Home` (interview/new),
`Interview`, `Profile`, `Feedback`, `NotFound`, `ForgotPassword`,
`ResetPassword`, `VerifyEmail`, and all seven admin pages.

### 72. `[x]` Brand suffix is double-appended
**LIVE.** `Landing.jsx:110` passes a title that already ends in the brand, and
`getPageTitle()` appends it again — the live tab read
`HirePilot AI — AI-Powered Career Intelligence | HirePilot AI`. Same in
`PracticeSetup.jsx:150` and `PracticeSession.jsx:82,98`.

### 73. `[x]` Private pages are indexable
**STATIC.** `components/common/SEO/SEO.jsx:66-72` — no page passes
`noIndex`, so dashboard, profile and admin are crawlable. No `robots.txt` or
`sitemap.xml` either.

### 74. `[x]` Internal deploy URL shown to users
**STATIC.** `pages/marketing/content.js:258` exposes
`https://hirepilot-frontend-mu.vercel.app` on the status page.

### 75. `[ ]` GDPR footer link shows the privacy policy
**STATIC.** `app.routes.jsx:90` maps `legal/gdpr` to the privacy content.

### 76. `[x]` Casing and wording inconsistencies
**LIVE + STATIC.** "New interview" (`Header.jsx:141`) vs "New Interview"
(`Dashboard.jsx:139`, `InterviewHistory.jsx:46`) · "Log in" (`Header.jsx:165`)
vs "Sign in" (`Register.jsx:108`) · "Get Started →" / "Get Started Free →" /
"Get started free" across `Header.jsx:168`, `Landing.jsx:210`,
`PricingPage.jsx:72` · "How HirePilot Works" drops the "AI"
(`Landing.jsx:117`) · `'Saving...'` vs `"Saving…"` (`Profile.jsx:123`) ·
`"specific -- use"` double hyphen (`PracticeSession.jsx:162`)

### 77. `[x]` Timing promise contradicts itself
**STATIC.** `Home.jsx:180` says "Approx 30s"; the loading state says "Usually
under a minute". The live generation took ~50s.

### 78. `[ ]` Two different default descriptions
**STATIC.** `config/brand.js:129-131` vs `index.html:23,45` disagree, and the
static `<title>` differs from `brand.seo.defaultTitle`, so the tab title
flashes the wrong text before mount.

### 79. `[x]` Generic filler copy
**STATIC.** `Register.jsx:104` "Start preparing for your dream job today" ·
`Feedback.jsx:42` "Help us build a better product. Your insights drive our
roadmap."

---

# P5 — Hygiene, dead code, consistency

### 80. `[ ]` Inconsistent API response envelopes
**STATIC.** Errors return `{ message, details?, stack? }`; successes return
`{ message, user }` / `{ message, interviewReport }` etc. No shared wrapper
(`Backend/src/middlewares/error.middleware.js:57-61`).

### 81. `[ ]` Bad credentials return 400 instead of 401
**STATIC.** `auth.controller.js:201,207`

### 82. `[ ]` Unhandled rejection only logs
**STATIC.** `Backend/server.js:53-55` — process continues in an unknown state.

### 83. `[ ]` Dead code
**STATIC.** `components/ui/DesignSystemTest.jsx` (imported nowhere) ·
`practice.api.js:76-79` `deleteSession` (never called) ·
`config/brand.js:291-297` `navigation.main` (never consumed) ·
`Home.jsx:1` unused `useRef` · legacy `resetPasswordController`
(`auth.controller.js:484-514`) is unreachable because nothing sets
`passwordResetTokenHash` any more · unused `passwordResetExpiresInMs`
(`env.js:81`) · unused `answeredTurns` virtual
(`interviewSession.model.js:143-145`) · unlinked routes `/docs/api`,
`/support/contact`, `/status`

### 84. `[ ]` Unsupported props passed silently
**STATIC.** `AdminDashboard.jsx:44-57` and `AdminAiUsage.jsx:66-93` pass
`variant` and `subtitle` to `EnhancedMetricCard`, which accepts neither
(`EnhancedMetricCard.jsx:16`), so the styling is silently dropped.

### 85. `[ ]` Unthrottled search requests
**STATIC.** `AdminUsers.jsx:78-81`, `AdminInterviews.jsx:58-59` — one API call
per keystroke, race-prone.

### 86. `[ ]` Storage and timer safety
**STATIC.** `app/theme/theme.context.jsx:7-19` reads `localStorage` with no
try/catch (unlike `tokenStorage.js`) · `Toast/ToastProvider.jsx:22-24` never
clears its dismiss timeouts on unmount

### 87. `[ ]` Shared loading flag causes unrelated spinners
**STATIC.** `features/interview/interview.context.jsx:7-9` — one global
`loading` covers list fetch, report fetch, generation and PDF download, so
"Download report" re-triggers the full-page spinner
(`Interview.jsx:444-445` → `:397`).

### 88. `[ ]` `useAuth` has no provider guard
**STATIC.** `features/auth/hooks/useAuth.js:40-44` destructures context without
a null check, unlike `useInterview.js:26-28`.

### 89. `[ ]` Misc backend hygiene
**STATIC.** Duplicated `logAiUsage` helper (`interview.controller.js:17-30` and
`session.controller.js:22-35`) · hardcoded model name in usage logs
(`chat.controller.js:112`) · `process.env` read directly instead of `config`
(`ai.service.js:10`) · debug `console.log` of cookie/auth state
(`auth.middleware.js:26-32`, `auth.controller.js:75-83`) · copy-paste
validation message "Technical question is required" on the behavioural schema
(`interviewReport.model.js:23`) · typo `generateInterViewReportController`
(`interview.controller.js:47`) · feature flags upserted on every GET
(`admin.controller.js:247-254`) · hardcoded Vercel origins in CORS
(`app.js:44-45`) · forced Google DNS (`config/database.js:9`) · no test script
at all (`package.json`)

### 90. `[ ]` Other auth hardening
**STATIC.** No max password length → bcrypt DoS
(`auth.controller.js:144-146`) · username/email enumeration on register
(`:156-158`) · no per-email OTP attempt lockout (`:264-284`) · `password` not
`select: false` (`user.model.js:17-20`) · unlimited refresh tokens per user
(`:65-73`) · `clearCookie` omits the options used to set the cookie, so logout
may not clear it in production (`profile.controller.js:269-270`,
`auth.controller.js:368-369`) · reset/verify tokens in URL paths get written to
Morgan access logs (`app.js:79`) · registration issues a session with no email
verification and `isEmailVerified` is never enforced anywhere

---

# Needs your decision

These change product behaviour or cost, so I have not assumed an answer:

- **A. Email verification gate.** Registration currently logs the user straight
  in and `isEmailVerified` is never checked. Should AI features be blocked until
  verification, or stay open?
- **B. CSRF strategy.** Proper fix is either a CSRF token on mutating routes, or
  moving to same-site deployment so cookies can be `SameSite=Lax`. The second is
  simpler but changes hosting.
- **C. Landing page claims (#26).** Remove the "Recording" mock and the "DOCX"
  claim, or build those features?
- **D. AI budget numbers (#9).** I need per-user limits — my default would be 5
  reports/hour and 60 scoring calls/hour.
- **E. `--color-info` hue (#49).** Keep the blue as a deliberate "information"
  accent, or fold it into the brass/forest palette?
- **F. Legacy `.button` system (#50).** Migrate all callers to the `Button`
  component and delete `style/button.scss`, or keep both?
