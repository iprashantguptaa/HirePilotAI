import { useEffect, useState } from "react"
import { getStats } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import { EnhancedMetricCard, SkeletonCard } from "../../../components/ui"

const AdminDashboard = () => {
    const [ stats, setStats ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const res = await getStats()
                if (!cancelled) setStats(res.stats)
            } catch (error) {
                toast?.error(error?.response?.data?.message || "Couldn't load admin stats.")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <h1>Admin <span className="highlight">Dashboard</span></h1>

            {loading ? (
                <div className="admin-stats-grid">
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                    <SkeletonCard height="7.5rem" />
                </div>
            ) : (
                <div className="admin-stats-grid">
                    <EnhancedMetricCard 
                        label="Total Users" 
                        value={stats.totalUsers} 
                        subtitle={`${stats.activeUsers} active`}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        }
                        variant="primary"
                    />
                    <EnhancedMetricCard 
                        label="Interview Reports" 
                        value={stats.totalReports} 
                        subtitle={`${stats.reportsLast30Days} in last 30 days`}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        }
                        variant="secondary"
                    />
                    <EnhancedMetricCard 
                        label="AI Conversations" 
                        value={stats.totalConversations}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        }
                        variant="accent"
                    />
                    <EnhancedMetricCard 
                        label="Avg Match Score" 
                        value={stats.averageMatchScore !== null ? `${stats.averageMatchScore}%` : "--"}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        }
                        variant="warning"
                    />
                    <EnhancedMetricCard 
                        label="New Signups (30d)" 
                        value={stats.signupsLast30Days}
                        trend={{ value: 12, isPositive: true }}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <line x1="19" y1="8" x2="19" y2="14"></line>
                                <line x1="22" y1="11" x2="16" y2="11"></line>
                            </svg>
                        }
                        variant="accent"
                    />
                    <EnhancedMetricCard 
                        label="Open Feedback" 
                        value={stats.openFeedbackCount}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        }
                        variant="error"
                    />
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
