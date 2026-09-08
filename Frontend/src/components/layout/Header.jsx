import { useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router"
import { useAuth } from "../../features/auth/hooks/useAuth"
import { useTheme } from "../../app/theme/useTheme"
import { Logo } from "../common/Logo"
import "./Header.scss"

const SunIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
)

const MoonIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
)

const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
)

const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
)

// Visitor nav: every item answers a distinct pre-signup question.
// "Product"/"Features"/"How it works" used to be three labels for the same
// landing page, and "Resources" pointed at docs nobody needs before signing up.
const LANDING_LINKS = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" }
]

const APP_LINKS = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Practice", to: "/practice" },
    { label: "History", to: "/history" },
    { label: "Profile", to: "/profile" }
]

/**
 * Smooth-scroll to a hash target on the current page, accounting for the
 * sticky header. Used by landing-section links so "How It Works" actually
 * lands on the section instead of being covered by the navbar.
 */
function scrollToHash(hash) {
    if (!hash || hash === "#") return false
    const id = hash.replace(/^#/, "")
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    return true
}

const Header = () => {
    const { user, bootstrapping, handleLogout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [ isMobileMenuOpen, setMobileMenuOpen ] = useState(false)
    const [ scrolled, setScrolled ] = useState(false)

    const isLanding = location.pathname === "/"

    const closeMenu = () => setMobileMenuOpen(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        if (!isMobileMenuOpen) return
        const onKey = (event) => {
            if (event.key === "Escape") closeMenu()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [ isMobileMenuOpen ])

    // Handle /#section deep links after navigation lands on "/".
    useEffect(() => {
        if (location.pathname !== "/" || !location.hash) return
        // Wait a frame so the landing DOM is painted.
        const id = window.requestAnimationFrame(() => scrollToHash(location.hash))
        return () => window.cancelAnimationFrame(id)
    }, [ location.pathname, location.hash ])

    const onLogout = async () => {
        closeMenu()
        await handleLogout()
        navigate("/login")
    }

    const handleLandingAnchor = (event, href) => {
        const hash = href.includes("#") ? `#${href.split("#")[ 1 ]}` : null
        if (!hash) return

        if (location.pathname === "/") {
            event.preventDefault()
            closeMenu()
            scrollToHash(hash)
            window.history.replaceState(null, "", hash)
        } else {
            closeMenu()
        }
    }

    return (
        <header className={`app-header ${scrolled ? "app-header--scrolled" : ""} ${isLanding ? "app-header--landing" : ""}`}>
            <div className="container app-header__inner">
                <Link to={user ? "/dashboard" : "/"} className="app-header__logo" onClick={closeMenu}>
                    <Logo size="md" />
                </Link>

                {/* One navbar for the whole product: signed-in users always get the
                    app links + identity, visitors always get the marketing links.
                    While the session is still resolving we render neither, so a
                    refresh doesn't flash "Log in / Get Started" at a signed-in user. */}
                <nav className={`app-header__nav ${isMobileMenuOpen ? "app-header__nav--open" : ""}`} aria-label="Primary">
                    {bootstrapping ? (
                        <span className="app-header__nav-placeholder" aria-hidden="true" />
                    ) : user ? (
                        <>
                            {APP_LINKS.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={closeMenu}
                                    className={({ isActive }) => (isActive ? "active" : undefined)}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            {user.role === "admin" && (
                                <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : undefined)}>
                                    Admin
                                </NavLink>
                            )}
                            <span className="app-header__username" title={user.username}>{user.username}</span>
                            <Link to="/interview/new" className="button primary-button button-sm" onClick={closeMenu}>
                                New Interview
                            </Link>
                            <button type="button" className="button secondary-button button-sm" onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {LANDING_LINKS.map((link) => (
                                link.href.startsWith("/#") ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={(event) => handleLandingAnchor(event, link.href)}
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link key={link.href} to={link.href} onClick={closeMenu}>
                                        {link.label}
                                    </Link>
                                )
                            ))}
                            <Link to="/login" className="button secondary-button button-sm app-header__auth-btn" onClick={closeMenu}>
                                Log in
                            </Link>
                            <Link to="/register" className="button primary-button button-sm app-header__auth-btn" onClick={closeMenu}>
                                Get started free
                            </Link>
                        </>
                    )}
                </nav>

                <div className="app-header__actions">
                    <button
                        type="button"
                        className="app-header__icon-button"
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <button
                        type="button"
                        className="app-header__icon-button app-header__menu-toggle"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
