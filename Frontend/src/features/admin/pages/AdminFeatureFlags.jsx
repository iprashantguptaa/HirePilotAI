import { useEffect, useState } from "react"
import { getFeatureFlags, upsertFeatureFlag } from "../services/admin.api"
import { useToast } from "../../../components/ui/Toast/useToast"
import { SkeletonCard } from "../../../components/ui"

const AdminFeatureFlags = () => {
    const [ flags, setFlags ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const toast = useToast()

    const load = async () => {
        setLoading(true)
        try {
            const res = await getFeatureFlags()
            setFlags(res.flags)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't load feature flags.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggle = async (flag) => {
        setFlags((current) => current.map((f) => (f.key === flag.key ? { ...f, enabled: !f.enabled } : f)))
        try {
            await upsertFeatureFlag(flag.key, { enabled: !flag.enabled })
            toast?.success(`${flag.label} ${!flag.enabled ? 'enabled' : 'disabled'}`)
        } catch (error) {
            toast?.error(error?.response?.data?.message || "Couldn't update flag.")
            load()
        }
    }

    return (
        <div>
            <h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Feature <span className="highlight">Flags</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
                Toggle experimental features and functionalities across the platform
            </p>

            <div className="admin-panel">
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        <SkeletonCard height="4rem" />
                        <SkeletonCard height="4rem" />
                        <SkeletonCard height="4rem" />
                    </div>
                ) : flags.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-faint)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--spacing-4)' }}>
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                        <p>No feature flags configured</p>
                    </div>
                ) : (
                    flags.map((flag) => (
                        <div key={flag.key} className="admin-flag-row">
                            <div className="admin-flag-row__info">
                                <p>{flag.label}</p>
                                <p>{flag.description || flag.key}</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={flag.enabled} onChange={() => handleToggle(flag)} />
                                <span />
                            </label>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AdminFeatureFlags
