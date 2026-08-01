import { useCallback, useEffect, useState } from "react"
import * as profileApi from "../services/profile.api"
import { useToast } from "../../../components/ui/Toast/useToast"

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback
}

export function useProfile() {
    const [ profile, setProfile ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ saving, setSaving ] = useState(false)
    const toast = useToast()

    const loadProfile = useCallback(async () => {
        setLoading(true)
        try {
            const response = await profileApi.getProfile()
            setProfile(response.profile)
        } catch (error) {
            toast?.error(getErrorMessage(error, "Couldn't load your profile."))
        } finally {
            setLoading(false)
        }
    }, [ toast ])

    useEffect(() => {
        loadProfile()
    }, [ loadProfile ])

    async function withSaving(action, successMessage) {
        setSaving(true)
        try {
            const result = await action()
            if (successMessage) toast?.success(successMessage)
            return result
        } catch (error) {
            toast?.error(getErrorMessage(error, "Something went wrong. Please try again."))
            return null
        } finally {
            setSaving(false)
        }
    }

    const updatePersonalInfo = (payload) => withSaving(async () => {
        const res = await profileApi.updateProfile(payload)
        setProfile(res.profile)
        return res.profile
    }, "Profile updated.")

    const updateNotifications = (payload) => withSaving(async () => {
        const res = await profileApi.updateNotificationPreferences(payload)
        setProfile((current) => ({ ...current, notificationPreferences: res.notificationPreferences }))
        return res.notificationPreferences
    }, "Notification preferences updated.")

    const changeAvatar = (file) => withSaving(async () => {
        const res = await profileApi.uploadAvatar(file)
        setProfile((current) => ({ ...current, avatar: res.avatar }))
        return res.avatar
    }, "Avatar updated.")

    const removeAvatar = () => withSaving(async () => {
        await profileApi.deleteAvatar()
        setProfile((current) => ({ ...current, avatar: null }))
    }, "Avatar removed.")

    const uploadResume = (file) => withSaving(async () => {
        const res = await profileApi.uploadProfileResume(file)
        setProfile((current) => ({ ...current, resume: res.resume }))
        return res.resume
    }, "Resume uploaded.")

    const removeResume = () => withSaving(async () => {
        await profileApi.deleteProfileResume()
        setProfile((current) => ({ ...current, resume: null }))
    }, "Resume removed.")

    const changePassword = (payload) => withSaving(async () => {
        const res = await profileApi.changePassword(payload)
        toast?.success(res.message)
        return true
    })

    const deleteAccount = (password) => withSaving(async () => {
        await profileApi.deleteAccount(password)
        return true
    })

    return {
        profile,
        loading,
        saving,
        reload: loadProfile,
        updatePersonalInfo,
        updateNotifications,
        changeAvatar,
        removeAvatar,
        uploadResume,
        removeResume,
        changePassword,
        deleteAccount
    }
}
