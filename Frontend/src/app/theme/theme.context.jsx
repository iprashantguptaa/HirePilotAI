import { createContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

const STORAGE_KEY = "theme"

function getInitialTheme() {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored

    // Dark mode first per the design goals, but respect an explicit
    // system preference for light mode on first visit.
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
    return prefersLight ? "light" : "dark"
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
