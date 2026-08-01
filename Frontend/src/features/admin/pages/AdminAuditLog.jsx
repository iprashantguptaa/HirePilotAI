import { useCallback, useEffect, useState } from "react"
import { getAuditLog } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import Pagination from "../components/Pagination"
import { EmptyState, SkeletonCard } from "../../../components/ui"

const AdminAuditLog = () => {
    const [ entries, setEntries ] = useState([])
    const [ pagination, setPagination ] = useState(null)
    const [ page, setPage ] = useState(1)
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getAuditLog({ page })
            setEntries(res.entries)
            setPagination(res.pagination)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't load audit log.")
        } finally {
            setLoading(false)
        }
    }, [ page, toast ])

    useEffect(() => { load() }, [ load ])

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Audit <span className="highlight">Log</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
                A complete record of all admin actions — role changes, deletions, and feature flag toggles
            </p>

            <div className="admin-panel">
                {pagination && !loading && (
                    <div style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                        Total: {pagination.total} audit entries
                    </div>
                )}
                
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                    </div>
                ) : entries.length === 0 ? (
                    <EmptyState 
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        }
                        title="No admin actions yet" 
                        description="Actions like role changes, deletions, and feature flag updates will be recorded here for audit purposes." 
                    />
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Performed By</th>
                                <th>Target</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry._id}>
                                    <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                                        {entry.action}
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>
                                        {entry.actor?.username || "System"}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>
                                        {entry.targetType ? `${entry.targetType}:${entry.targetId?.slice(0, 8)}...` : "--"}
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {new Date(entry.createdAt).toLocaleString('en-IN', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
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

export default AdminAuditLog
