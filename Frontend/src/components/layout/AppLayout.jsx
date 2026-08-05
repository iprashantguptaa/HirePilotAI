import { Outlet, useLocation } from "react-router"
import Header from "./Header"
import Footer from "./Footer"

const AppLayout = () => {
    const location = useLocation()
    // Landing owns its own full-bleed composition; app pages use the
    // standard content shell. Header and Footer are shared everywhere so
    // the product feels like one application.
    const isLandingPage = location.pathname === "/"
    // Focused interview UI — hide the marketing footer so long AI waits
    // don't end with an accidental click on "System Status" / other links.
    const isPracticeSession = /^\/practice\/[^/]+/.test(location.pathname)

    return (
        <>
            <Header />
            <main className={isLandingPage ? "landing-shell" : "app-content"}>
                <Outlet />
            </main>
            {!isPracticeSession && <Footer />}
        </>
    )
}

export default AppLayout
