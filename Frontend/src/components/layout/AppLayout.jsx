import { Outlet } from "react-router"
import Header from "./Header"
import Footer from "./Footer"

const AppLayout = () => {
    return (
        <>
            <Header />
            <main className="app-content">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default AppLayout
