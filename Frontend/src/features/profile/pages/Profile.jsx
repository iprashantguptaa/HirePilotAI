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
            <header className="profile-page__header">
                <h1>Profile & <span className="highlight">Settings</span></h1>
            </header>

            <section className="profile-panel">
                <AvatarUploader
                    avatar={profile.avatar}
                    username={profile.username}
                    saving={saving}
                    onUpload={changeAvatar}
                    onRemove={removeAvatar}
                />
                <div className="profile-panel__identity">
                    <p className="profile-panel__username">{profile.username}</p>
                    <p className="profile-panel__email">
                        {profile.email}
                        {!profile.isEmailVerified && (
                            <>
                                <span className="badge-unverified">Unverified</span>
                                <button type="button" className="button ghost-button button-sm" onClick={handleResendVerification}>
                                    Resend verification email
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </section>

            <form className="profile-panel" onSubmit={handleSavePersonalInfo}>
                <h2>Personal information</h2>
                <label className="field">
                    <span>Headline</span>
                    <input
                        type="text" maxLength={120} placeholder="e.g. Full Stack Developer | MERN Stack Expert"
                        value={form.headline}
                        onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    />
                </label>
                <label className="field">
                    <span>Bio</span>
                    <textarea
                        maxLength={500} rows={4}
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                </label>

                <h3 className="profile-panel__subtitle">Skills</h3>
                <SkillsInput skills={form.skills} onChange={(skills) => setForm({ ...form, skills })} />

                <h3 className="profile-panel__subtitle">Experience</h3>
                <ExperienceEditor experience={form.experience} onChange={(experience) => setForm({ ...form, experience })} />

                <h3 className="profile-panel__subtitle">Education</h3>
                <EducationEditor education={form.education} onChange={(education) => setForm({ ...form, education })} />

                <button type="submit" className="button primary-button" disabled={saving}>
                    Save changes
                </button>
            </form>

            <section className="profile-panel">
                <h2>Resume management</h2>
                <p className="profile-panel__muted">
                    Save a default resume so you don't have to upload one every time you start a new interview.
                </p>
                {profile.resume ? (
                    <div className="resume-summary">
                        <span>{profile.resume.fileName}</span>
                        <span className="profile-panel__muted">Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}</span>
                        <button type="button" className="button ghost-button button-sm" onClick={removeResume}>Remove</button>
                    </div>
                ) : (
                    <p className="profile-panel__muted">No resume saved yet.</p>
                )}
                <input
                    ref={resumeInputRef} type="file" accept="application/pdf" hidden
                    onChange={(e) => { const f = e.target.files[ 0 ]; if (f) uploadResume(f); e.target.value = "" }}
                />
                <button type="button" className="button secondary-button button-sm" disabled={saving} onClick={() => resumeInputRef.current?.click()}>
                    {profile.resume ? "Replace resume" : "Upload resume"}
                </button>
            </section>

            <section className="profile-panel">
                <h2>Notification settings</h2>
                <label className="toggle-row">
                    <input
                        type="checkbox"
                        checked={profile.notificationPreferences?.emailOnReportReady ?? true}
                        onChange={(e) => updateNotifications({ emailOnReportReady: e.target.checked })}
                    />
                    Email me when a new interview report is ready
                </label>
                <label className="toggle-row">
                    <input
                        type="checkbox"
                        checked={profile.notificationPreferences?.productUpdates ?? false}
                        onChange={(e) => updateNotifications({ productUpdates: e.target.checked })}
                    />
                    Send me occasional product updates
                </label>
            </section>

            <form className="profile-panel" onSubmit={handlePasswordSubmit}>
                <h2>Change password</h2>
                <label className="field">
                    <span>Current password</span>
                    <input
                        type="password" required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                </label>
                <label className="field">
                    <span>New password</span>
                    <input
                        type="password" required minLength={8}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                </label>
                <label className="field">
                    <span>Confirm new password</span>
                    <input
                        type="password" required minLength={8}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                </label>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="field-error">Passwords don't match.</p>
                )}
                <button type="submit" className="button primary-button" disabled={saving}>
                    Change password
                </button>
                <p className="profile-panel__muted">You'll be logged out of all devices after this.</p>
            </form>

            <section className="profile-panel profile-panel--danger">
                <h2>Danger zone</h2>
                <p className="profile-panel__muted">
                    Deleting your account permanently removes your profile, interview reports, and chat history. This cannot be undone.
                </p>
                {!confirmingDelete ? (
                    <button type="button" className="button danger-button" onClick={() => setConfirmingDelete(true)}>
                        Delete account
                    </button>
                ) : (
                    <div className="danger-confirm">
                        <label className="field">
                            <span>Enter your password to confirm</span>
                            <input
                                type="password" value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                            />
                        </label>
                        <div className="danger-confirm__actions">
                            <button type="button" className="button danger-button" disabled={saving || !deletePassword} onClick={handleDeleteAccount}>
                                Permanently delete my account
                            </button>
                            <button type="button" className="button ghost-button" onClick={() => { setConfirmingDelete(false); setDeletePassword("") }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Profile
