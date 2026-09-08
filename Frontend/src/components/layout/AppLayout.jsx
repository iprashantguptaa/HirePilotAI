import { Outlet, useLocation } from "react-router"
import Header from "./Header"
import Footer from "./Footer"

const AppLayout = () => {
    const location = useLocation()
    const isLandingPage = location.pathname === "/"
    // Focused interview UI — hide marketing chrome so long AI waits don't end
    // with an accidental click on an unrelated link.
    const isPracticeSession = /^\/practice\/[^/]+/.test(location.pathname)
    const isReportWorkspace = /^\/interview\/(?!new$).+/.test(location.pathname)

    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            {!isPracticeSession && <Header />}
            <main id="main-content" className={isLandingPage ? "landing-shell" : "app-content"} tabIndex={-1}>
                <Outlet />
            </main>
            {!isPracticeSession && !isReportWorkspace && <Footer />}
        </>
    )
}

export default AppLayout
