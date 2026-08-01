import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { getInterviews, deleteInterview } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import Pagination from "../components/Pagination"
import { SkeletonCard, Button, EmptyState } from "../../../components/ui"

const AdminInterviews = () => {
    const [ reports, setReports ] = useState([])
    const [ pagination, setPagination ] = useState(null)
    const [ page, setPage ] = useState(1)
    const [ search, setSearch ] = useState("")
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getInterviews({ page, search })
            setReports(res.reports)
            setPagination(res.pagination)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't load interview reports.")
        } finally {
            setLoading(false)
        }
    }, [ page, search, toast ])

    useEffect(() => { load() }, [ load ])

    const handleDelete = async (report) => {
        if (!window.confirm(`Delete "${report.title || "this report"}"? This can't be undone.`)) return
        try {
            await deleteInterview(report._id)
            toast?.success("Report deleted.")
            load()
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't delete report.")
        }
    }

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Interview <span className="highlight">Reports</span>
            </h1>

            <div className="admin-panel">
                <div className="admin-toolbar">
                    <input
                        type="search" placeholder="Search by job title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237d8590' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: '16px center', paddingLeft: '48px' }}
                    />
                    {pagination && (
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', padding: 'var(--spacing-3)' }}>
                            Total: {pagination.total} reports
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                        <SkeletonCard height="3rem" />
                    </div>
                ) : reports.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        }
                        title="No interview reports"
                        description={search ? "No reports match your search" : "Interview reports will appear here"}
                    />
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>User</th>
                                <th>Match Score</th>
                                <th>Created</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((r) => (
                                <tr key={r._id}>
                                    <td>
                                        <Link 
                                            to={`/interview/${r._id}`} 
                                            style={{ 
                                                color: 'var(--color-primary-500)', 
                                                fontWeight: 'var(--font-weight-semibold)',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            {r.title || "Untitled Position"}
                                        </Link>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>
                                        {r.user?.username || "Deleted user"}
                                    </td>
                                    <td>
                                        <span className={`admin-badge admin-badge--${r.matchScore >= 80 ? 'active' : r.matchScore >= 60 ? 'open' : 'suspended'}`}>
                                            {r.matchScore ?? "--"}%
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(r)}>
                                            Delete
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

export default AdminInterviews
