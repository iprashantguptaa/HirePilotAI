import { useRef } from "react"

const AvatarUploader = ({ avatar, username, onUpload, onRemove, saving }) => {
    const inputRef = useRef(null)

    const initials = (username || "?").slice(0, 2).toUpperCase()

    const handleFileChange = (e) => {
        const file = e.target.files[ 0 ]
        if (file) onUpload(file)
        e.target.value = ""
    }

    return (
        <div className="avatar-uploader">
            <div className="avatar-uploader__preview">
                {avatar ? <img src={avatar} alt="Profile avatar" /> : <span>{initials}</span>}
            </div>
            <div className="avatar-uploader__actions">
                <button type="button" className="button secondary-button button-sm" disabled={saving} onClick={() => inputRef.current?.click()}>
                    Change photo
                </button>
                {avatar && (
                    <button type="button" className="button ghost-button button-sm" disabled={saving} onClick={onRemove}>
                        Remove
                    </button>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={handleFileChange}
                />
            </div>
        </div>
    )
}

export default AvatarUploader
