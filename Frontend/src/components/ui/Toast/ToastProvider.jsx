import { createContext, useCallback, useMemo, useState } from "react"
import "./toast.scss"

export const ToastContext = createContext()

let idCounter = 0

export const ToastProvider = ({ children }) => {
    const [ toasts, setToasts ] = useState([])

    const dismissToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message, { type = "info", duration = 4000 } = {}) => {
        const id = ++idCounter
        setToasts((current) => [ ...current, { id, message, type } ])

        if (duration > 0) {
            setTimeout(() => dismissToast(id), duration)
        }

        return id
    }, [ dismissToast ])

    const api = useMemo(() => ({
        showToast,
        dismissToast,
        success: (message, options) => showToast(message, { ...options, type: "success" }),
        error: (message, options) => showToast(message, { ...options, type: "error" }),
        info: (message, options) => showToast(message, { ...options, type: "info" }),
        warning: (message, options) => showToast(message, { ...options, type: "warning" })
    }), [ showToast, dismissToast ])

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="toast-viewport" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast--${toast.type}`}>
                        <span className="toast__message">{toast.message}</span>
                        <button
                            type="button"
                            className="toast__dismiss"
                            aria-label="Dismiss notification"
                            onClick={() => dismissToast(toast.id)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
