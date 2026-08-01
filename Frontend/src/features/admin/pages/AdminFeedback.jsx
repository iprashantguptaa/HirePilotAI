import { useCallback, useEffect, useState } from "react"
import { getFeedback, updateFeedback } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import Pagination from "../components/Pagination"
import { EmptyState, SkeletonCard, Button } from "../../../components/ui"

const AdminFeedback = () => {
    const [ items, setItems ] = useState([])
    const [ pagination, setPagination ] = useState(null)
    const [ page, setPage ] = useState(1)
    const [ status, setStatus ] = useState("")
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getFeedback({ page, status })
            setItems(res.feedback)
            setPagination(res.pagination)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't load feedback.")
        } finally {
            setLoading(false)
        }
    }, [ page, status, toast ])

    useEffect(() => { load() }, [ load ])

    const toggleStatus = async (item) => {
        const nextStatus = item.status === "open" ? "resolved" : "open"
        try {
            await updateFeedback(item._id, nextStatus)
            toast?.success(`Feedback marked as ${nextStatus}`)
            load()
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't update feedback.")
        }
    }

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                User <span className="highlight">Feedback</span>
            </h1>

            <div className="admin-panel">
                <div className="admin-toolbar">
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
                        <option value="">All Feedback</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    {pagination && (
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--spacing-3)' }}>
                            Total: {pagination.total} feedback
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        <SkeletonCard height="4rem" />
                        <SkeletonCard height="4rem" />
                        <SkeletonCard height="4rem" />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState 
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        }
                        title="No feedback yet" 
                        description="User feedback will appear here. Encourage users to share their thoughts!" 
                    />
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Category</th>
                                <th>Message</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                        {item.user?.username || "Unknown"}
                                    </td>
                                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>
                                        {item.category}
                                    </td>
                                    <td style={{ maxWidth: "400px", color: 'var(--color-text-primary)' }}>
                                        {item.message}
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td>
                                        <span className={`admin-badge admin-badge--${item.status}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(item)}>
                                            {item.status === "open" ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    Mark Resolved
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                    </svg>
                                                    Reopen
                                                </>
                                            )}
                                        </Button>
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

export default AdminFeedback
