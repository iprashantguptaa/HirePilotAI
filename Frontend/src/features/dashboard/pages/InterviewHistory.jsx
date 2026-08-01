import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { useInterview } from "../../interview/hooks/useInterview"
import { EmptyState, SkeletonCard, Button } from "../../../components/ui"
import "./history.scss"

const scoreClass = (score) => (score >= 80 ? "score--high" : score >= 60 ? "score--mid" : "score--low")

const SORT_OPTIONS = {
    recent: { label: "Most recent", compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    oldest: { label: "Oldest first", compare: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
    highest: { label: "Highest score", compare: (a, b) => (b.matchScore || 0) - (a.matchScore || 0) },
    lowest: { label: "Lowest score", compare: (a, b) => (a.matchScore || 0) - (b.matchScore || 0) }
}

const InterviewHistory = () => {
    const { reports, loading, getReports } = useInterview()
    const [ search, setSearch ] = useState("")
    const [ sortKey, setSortKey ] = useState("recent")

    useEffect(() => {
        getReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const visibleReports = useMemo(() => {
        const filtered = (reports || []).filter((report) =>
            (report.title || "Untitled position").toLowerCase().includes(search.toLowerCase())
        )
        return [ ...filtered ].sort(SORT_OPTIONS[ sortKey ].compare)
    }, [ reports, search, sortKey ])

    return (
        <div className="history-page container">
            <header className="history-page__header">
                <div>
                    <h1>Interview <span className="highlight">History</span></h1>
                    <p>Every interview plan you've generated, in one place.</p>
                </div>
                <Link to="/interview/new">
                    <Button variant="primary" size="lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Interview
                    </Button>
                </Link>
            </header>

            {!loading && reports.length > 0 && (
                <div className="history-page__controls">
                    <input
                        type="search"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="history-page__search"
                    />
                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        className="history-page__sort"
                    >
                        {Object.entries(SORT_OPTIONS).map(([ key, option ]) => (
                            <option key={key} value={key}>{option.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {loading && !reports.length ? (
                <div className="history-page__list">
                    <SkeletonCard height="5.5rem" />
                    <SkeletonCard height="5.5rem" />
                    <SkeletonCard height="5.5rem" />
                    <SkeletonCard height="5.5rem" />
                </div>
            ) : reports.length === 0 ? (
                <EmptyState
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    }
                    title="No interviews yet"
                    description="Once you generate an interview plan, it will show up here. Start by creating your first interview preparation plan."
                    action={
                        <Link to="/interview/new">
                            <Button variant="primary" size="lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Create your first interview
                            </Button>
                        </Link>
                    }
                />
            ) : visibleReports.length === 0 ? (
                <EmptyState 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    }
                    title="No matches found" 
                    description="Try adjusting your search term or filters." 
                />
            ) : (
                <ul className="history-page__list">
                    {visibleReports.map((report) => (
                        <li key={report._id}>
                            <Link to={`/interview/${report._id}`} className="history-item">
                                <div className="history-item__main">
                                    <h3>{report.title || "Untitled position"}</h3>
                                    <p>{new Date(report.createdAt).toLocaleDateString('en-IN', { year: "numeric", month: "short", day: "numeric" })}</p>
                                </div>
                                <span className={`match-badge ${scoreClass(report.matchScore)}`}>{report.matchScore}%</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default InterviewHistory
