import { NavLink, Outlet } from "react-router"
import "./admin.scss"

const NAV_LINKS = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/interviews", label: "Interviews" },
    { to: "/admin/ai-usage", label: "AI Usage" },
    { to: "/admin/feature-flags", label: "Feature Flags" },
    { to: "/admin/feedback", label: "Feedback" },
    { to: "/admin/audit-log", label: "Audit Log" }
]

const AdminLayout = () => {
    return (
        <div className="admin-shell container">
            <aside className="admin-sidebar">
                <p className="admin-sidebar__title">Admin</p>
                <nav>
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
