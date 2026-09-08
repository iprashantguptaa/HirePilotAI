import { createContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

const STORAGE_KEY = "theme"

function getInitialTheme() {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
    // Light-first product default (calmer, more “shipping product” than dark SaaS).
    return "light"
}

export const ThemeProvider = ({ children }) => {
    const [ theme, setTheme ] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        window.localStorage.setItem(STORAGE_KEY, theme)
    }, [ theme ])

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"))
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
