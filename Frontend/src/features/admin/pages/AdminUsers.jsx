import { useCallback, useEffect, useState } from "react"
import { getUsers, updateUser, deleteUser } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import { useAuth } from "../../auth/hooks/useAuth"
import Pagination from "../components/Pagination"
import { Button, SkeletonCard } from "../../../components/ui"

const AdminUsers = () => {
    const [ users, setUsers ] = useState([])
    const [ pagination, setPagination ] = useState(null)
    const [ page, setPage ] = useState(1)
    const [ search, setSearch ] = useState("")
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()
    const { user: currentUser } = useAuth()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getUsers({ page, search })
            setUsers(res.users)
            setPagination(res.pagination)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't load users.")
        } finally {
            setLoading(false)
        }
    }, [ page, search, toast ])

    useEffect(() => { load() }, [ load ])

    const handleRoleToggle = async (u) => {
        const nextRole = u.role === "admin" ? "user" : "admin"
        try {
            await updateUser(u._id, { role: nextRole })
            toast?.success(`${u.username} is now ${nextRole}.`)
            load()
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't update role.")
        }
    }

    const handleActiveToggle = async (u) => {
        try {
            await updateUser(u._id, { isActive: !u.isActive })
            toast?.success(`${u.username} ${u.isActive ? "suspended" : "reactivated"}.`)
            load()
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't update account status.")
        }
    }

    const handleDelete = async (u) => {
        if (!window.confirm(`Permanently delete ${u.username}? This removes all their data.`)) return
        try {
            await deleteUser(u._id)
            toast?.success(`${u.username} deleted.`)
            load()
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't delete user.")
        }
    }

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                User <span className="highlight">Management</span>
            </h1>

            <div className="admin-panel">
                <div className="admin-toolbar">
                    <input
                        type="search" placeholder="Search by username or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237d8590' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: '16px center', paddingLeft: '48px' }}
                    />
                    {pagination && (
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--spacing-3)' }}>
                            Total: {pagination.total} users
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-faint)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--spacing-4)' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-2)' }}>No users found</p>
                        <p style={{ fontSize: 'var(--text-sm)' }}>Try adjusting your search query</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{u.username}</td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                                    <td>
                                        <span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge admin-badge--${u.isActive ? "active" : "suspended"}`}>
                                            {u.isActive ? "active" : "suspended"}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td>
                                        {u._id !== currentUser?.id ? (
                                            <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: 'flex-end' }}>
                                                <Button variant="ghost" size="sm" onClick={() => handleRoleToggle(u)}>
                                                    {u.role === "admin" ? "Make user" : "Make admin"}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleActiveToggle(u)}>
                                                    {u.isActive ? "Suspend" : "Reactivate"}
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(u)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'right', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
                                                (You)
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
        </div>
    )
}

export default AdminUsers
