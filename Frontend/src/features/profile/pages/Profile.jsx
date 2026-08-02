import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useProfile } from "../hooks/useProfile"
import { useAuth } from "../../auth/hooks/useAuth"
import AvatarUploader from "../components/AvatarUploader"
import SkillsInput from "../components/SkillsInput"
import ExperienceEditor from "../components/ExperienceEditor"
import EducationEditor from "../components/EducationEditor"
import { SkeletonCard } from "../../../components/ui"
import "./profile.scss"

const Profile = () => {
    const {
        profile, loading, saving, updatePersonalInfo, updateNotifications,
        changeAvatar, removeAvatar, uploadResume, removeResume, changePassword, deleteAccount
    } = useProfile()
    const { handleLogout, handleResendVerification } = useAuth()
    const navigate = useNavigate()

    const [ form, setForm ] = useState(null)
    const resumeInputRef = useRef(null)

    const [ passwordForm, setPasswordForm ] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
    const [ deletePassword, setDeletePassword ] = useState("")
    const [ confirmingDelete, setConfirmingDelete ] = useState(false)

    useEffect(() => {
        if (profile) {
            setForm({
                headline: profile.headline || "",
                bio: profile.bio || "",
                skills: profile.skills || [],
                experience: profile.experience || [],
                education: profile.education || []
            })
        }
    }, [ profile ])

    if (loading || !form) {
        return (
            <div className="profile-page container">
                <SkeletonCard height="8rem" />
                <SkeletonCard height="16rem" />
            </div>
        )
    }

    const handleSavePersonalInfo = async (e) => {
        e.preventDefault()
        await updatePersonalInfo(form)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return
        }
        const ok = await changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })
        if (ok) {
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
            await handleLogout()
            navigate("/login")
        }
    }

    const handleDeleteAccount = async () => {
        const ok = await deleteAccount(deletePassword)
        if (ok) {
            navigate("/login")
        }
    }

    return (
        <div className="profile-page container">
            {/* Premium Profile Header Card */}
            <div className="profile-hero">
                <div className="profile-hero__avatar">
                    <AvatarUploader
                        avatar={profile.avatar}
                        username={profile.username}
                        saving={saving}
                        onUpload={changeAvatar}
                        onRemove={removeAvatar}
                    />
                </div>
                
                <div className="profile-hero__info">
                    <div className="profile-hero__name-group">
                        <h1 className="profile-hero__name">{profile.username}</h1>
                        {profile.headline && (
                            <p className="profile-hero__headline">{profile.headline}</p>
                        )}
                    </div>
                    
                    <div className="profile-hero__meta">
                        <div className="profile-hero__email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m2 7 10 6 10-6"/>
                            </svg>
                            <span>{profile.email}</span>
                            {!profile.isEmailVerified && (
                                <>
                                    <span className="profile-hero__badge profile-hero__badge--warning">Unverified</span>
                                    <button type="button" className="profile-hero__link" onClick={handleResendVerification}>
                                        Resend
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <form className="profile-card" onSubmit={handleSavePersonalInfo}>
                <div className="profile-card__header">
                    <h2 className="profile-card__title">About</h2>
                    <button type="submit" className="button primary-button button-sm" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                
                <div className="profile-card__body">
                    <label className="profile-field">
                        <span className="profile-field__label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Professional Headline
                        </span>
                        <input
                            type="text" 
                            maxLength={120} 
                            placeholder="e.g. Full Stack Developer | MERN Stack Expert"
                            value={form.headline}
                            onChange={(e) => setForm({ ...form, headline: e.target.value })}
                            className="profile-field__input"
                        />
                        <span className="profile-field__hint">How you'd introduce yourself professionally</span>
                    </label>
                    
                    <label className="profile-field">
                        <span className="profile-field__label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <line x1="10" y1="9" x2="8" y2="9"/>
                            </svg>
                            Bio
                        </span>
                        <textarea
                            maxLength={500} 
                            rows={4}
                            placeholder="Tell us about yourself, your experience, and what drives you..."
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            className="profile-field__input"
                        />
                        <span className="profile-field__hint">{form.bio.length}/500 characters</span>
                    </label>
                </div>
            </form>

            {/* Skills Section */}
            <div className="profile-card">
                <div className="profile-card__header">
                    <h2 className="profile-card__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                        </svg>
                        Skills & Technologies
                    </h2>
                </div>
                <div className="profile-card__body">
                    <SkillsInput skills={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
                </div>
            </div>

            {/* Experience Section */}
            <div className="profile-card">
                <div className="profile-card__header">
                    <h2 className="profile-card__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        Work Experience
                    </h2>
                </div>
                <div className="profile-card__body">
                    <ExperienceEditor experience={form.experience} onChange={(experience) => setForm({ ...form, experience })} />
                </div>
            </div>

            {/* Education Section */}
            <div className="profile-card">
                <div className="profile-card__header">
                    <h2 className="profile-card__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        Education
                    </h2>
                </div>
                <div className="profile-card__body">
                    <EducationEditor education={form.education} onChange={(education) => setForm({ ...form, education })} />
                </div>
            </div>

            {/* Settings Grid */}
            <div className="profile-grid">
                {/* Resume Management */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <h2 className="profile-card__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Resume
                        </h2>
                    </div>
                    <div className="profile-card__body">
                        <p className="profile-card__desc">
                            Save a default resume for faster interview preparation.
                        </p>
                        {profile.resume ? (
                            <div className="resume-badge">
                                <div className="resume-badge__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                </div>
                                <div className="resume-badge__info">
                                    <span className="resume-badge__name">{profile.resume.fileName}</span>
                                    <span className="resume-badge__date">
                                        Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <button type="button" className="resume-badge__remove" onClick={removeResume}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="profile-empty-state">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span>No resume uploaded</span>
                            </div>
                        )}
                        <input
                            ref={resumeInputRef} type="file" accept="application/pdf" hidden
                            onChange={(e) => { const f = e.target.files[0]; if (f) uploadResume(f); e.target.value = "" }}
                        />
                        <button type="button" className="button secondary-button button-sm" disabled={saving} onClick={() => resumeInputRef.current?.click()}>
                            {profile.resume ? "Replace Resume" : "Upload Resume"}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <h2 className="profile-card__title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            Notifications
                        </h2>
                    </div>
                    <div className="profile-card__body">
                        <label className="profile-toggle">
                            <div className="profile-toggle__info">
                                <span className="profile-toggle__label">Interview Reports</span>
                                <span className="profile-toggle__desc">Get notified when reports are ready</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={profile.notificationPreferences?.emailOnReportReady ?? true}
                                onChange={(e) => updateNotifications({ emailOnReportReady: e.target.checked })}
                                className="profile-toggle__input"
                            />
                            <div className="profile-toggle__switch"></div>
                        </label>
                        <label className="profile-toggle">
                            <div className="profile-toggle__info">
                                <span className="profile-toggle__label">Product Updates</span>
                                <span className="profile-toggle__desc">Occasional news and features</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={profile.notificationPreferences?.productUpdates ?? false}
                                onChange={(e) => updateNotifications({ productUpdates: e.target.checked })}
                                className="profile-toggle__input"
                            />
                            <div className="profile-toggle__switch"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <form className="profile-card" onSubmit={handlePasswordSubmit}>
                <div className="profile-card__header">
                    <h2 className="profile-card__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Change Password
                    </h2>
                </div>
                <div className="profile-card__body">
                    <label className="profile-field">
                        <span className="profile-field__label">Current Password</span>
                        <input
                            type="password" 
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="profile-field__input"
                        />
                    </label>
                    <label className="profile-field">
                        <span className="profile-field__label">New Password</span>
                        <input
                            type="password" 
                            required 
                            minLength={8}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="profile-field__input"
                        />
                    </label>
                    <label className="profile-field">
                        <span className="profile-field__label">Confirm New Password</span>
                        <input
                            type="password" 
                            required 
                            minLength={8}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="profile-field__input"
                        />
                    </label>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <div className="field-error">Passwords don't match</div>
                    )}
                    <div className="profile-card__footer">
                        <button type="submit" className="button primary-button" disabled={saving}>
                            Update Password
                        </button>
                        <p className="profile-card__hint">You'll be logged out of all devices</p>
                    </div>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="profile-card profile-card--danger">
                <div className="profile-card__header">
                    <h2 className="profile-card__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Danger Zone
                    </h2>
                </div>
                <div className="profile-card__body">
                    <p className="profile-card__desc">
                        Deleting your account permanently removes your profile, interview reports, and chat history. This cannot be undone.
                    </p>
                    {!confirmingDelete ? (
                        <button type="button" className="button danger-button" onClick={() => setConfirmingDelete(true)}>
                            Delete Account
                        </button>
                    ) : (
                        <div className="profile-danger-confirm">
                            <label className="profile-field">
                                <span className="profile-field__label">Enter your password to confirm</span>
                                <input
                                    type="password" 
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="profile-field__input"
                                    placeholder="Your password"
                                />
                            </label>
                            <div className="profile-danger-confirm__actions">
                                <button type="button" className="button danger-button" disabled={saving || !deletePassword} onClick={handleDeleteAccount}>
                                    Permanently Delete Account
                                </button>
                                <button type="button" className="button ghost-button" onClick={() => { setConfirmingDelete(false); setDeletePassword("") }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
