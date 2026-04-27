import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
}               from 'react'

// ─── Types ────────────────────────────────────────────
type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme:       Theme
  toggleTheme: () => void
  isDark:      boolean
}

// ─── Context ──────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | null>(null)

// ─── Provider ─────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from localStorage on first load
    const stored = localStorage.getItem('theme') as Theme | null
    return stored ?? 'dark'
  })

  // ── Apply theme to <html> element ─────────────────
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  // ── Toggle ─────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}