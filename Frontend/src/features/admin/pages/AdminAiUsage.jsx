import { useEffect, useState } from "react"
import { getAiUsage } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import { EnhancedMetricCard, SkeletonCard } from "../../../components/ui"

const TYPE_LABELS = {
    interview_report: "Interview Reports",
    resume_pdf: "Resume PDFs",
    chat_reply: "AI Chat Replies"
}

const AdminAiUsage = () => {
    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const res = await getAiUsage()
                if (!cancelled) setData(res)
            } catch (error) {
                toast?.error(error?.response?.data?.message || "Couldn't load AI usage.")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading || !data) {
        return (
            <div>
                <h1>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                        <path d="M12 20v-6M6 20V10M18 20V4"/>
                    </svg>
                    AI <span className="highlight">Usage</span>
                </h1>
                <div className="admin-stats-grid">
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M12 20v-6M6 20V10M18 20V4"/>
                </svg>
                AI <span className="highlight">Usage</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
                Monitor AI API calls, token consumption, and usage patterns across the platform
            </p>

            <div className="admin-stats-grid">
                <EnhancedMetricCard 
                    label="Total AI Calls" 
                    value={data.overall.calls.toLocaleString()}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    }
                    variant="primary"
                />
                <EnhancedMetricCard 
                    label="Total Tokens Used" 
                    value={data.overall.totalTokens.toLocaleString()}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    }
                    variant="secondary"
                />
                {data.totalsByType.map((t, index) => (
                    <EnhancedMetricCard 
                        key={t._id} 
                        label={TYPE_LABELS[ t._id ] || t._id} 
                        value={t.calls.toLocaleString()} 
                        subtitle={`${t.totalTokens.toLocaleString()} tokens`}
                        icon={
                            t._id === 'interview_report' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            ) : t._id === 'resume_pdf' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            )
                        }
                        variant={index % 3 === 0 ? "accent" : index % 3 === 1 ? "warning" : "error"}
                    />
                ))}
            </div>

            <div className="admin-panel">
                <h2 style={{ marginBottom: "var(--spacing-6)", fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Recent AI Calls
                </h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>User</th>
                            <th>Tokens</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentEntries.map((entry) => (
                            <tr key={entry._id}>
                                <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                                    {TYPE_LABELS[ entry.type ] || entry.type}
                                </td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>
                                    {entry.user?.username || "System"}
                                </td>
                                <td style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-primary)' }}>
                                    {entry.totalTokens.toLocaleString()}
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
            </div>
        </div>
    )
}

export default AdminAiUsage
