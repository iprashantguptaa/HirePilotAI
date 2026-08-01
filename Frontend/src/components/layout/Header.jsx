import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "../../features/auth/hooks/useAuth"
import { useTheme } from "../../app/theme/useTheme"
import { useBrand } from "../../hooks/useBrand"
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

const Header = () => {
    const { user, handleLogout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const brand = useBrand()
    const navigate = useNavigate()
    const [ isMobileMenuOpen, setMobileMenuOpen ] = useState(false)

    const closeMenu = () => setMobileMenuOpen(false)

    const onLogout = async () => {
        closeMenu()
        await handleLogout()
        navigate("/login")
    }

    return (
        <header className="app-header">
            <div className="container app-header__inner">
                <Link to="/" className="app-header__logo" onClick={closeMenu}>
                    {brand.productName}
                </Link>

                <nav className={`app-header__nav ${isMobileMenuOpen ? "app-header__nav--open" : ""}`}>
                    {user ? (
                        <>
                            <Link to="/" onClick={closeMenu}>Dashboard</Link>
                            <Link to="/history" onClick={closeMenu}>History</Link>
                            <Link to="/profile" onClick={closeMenu}>Profile</Link>
                            {user.role === "admin" && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
                            <span className="app-header__username">{user.username}</span>
                            <Link to="/interview/new" className="button primary-button button-sm" onClick={closeMenu}>
                                New interview
                            </Link>
                            <button type="button" className="button secondary-button button-sm" onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="button primary-button button-sm" onClick={closeMenu}>
                                Get started
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
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
