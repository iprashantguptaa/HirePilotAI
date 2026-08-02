import { Outlet, useLocation } from "react-router"
import Header from "./Header"
import Footer from "./Footer"

const AppLayout = () => {
    const location = useLocation()
    const isLandingPage = location.pathname === "/"
    
    return (
        <>
            {!isLandingPage && <Header />}
            <main className={isLandingPage ? "" : "app-content"}>
                <Outlet />
            </main>
            {!isLandingPage && <Footer />}
        </>
    )
}

export default AppLayout
