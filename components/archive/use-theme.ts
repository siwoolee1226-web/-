"use client"

import { useCallback, useEffect, useState } from "react"

type Theme = "light" | "dark"

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("hq-archive-theme") as Theme | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light")
    apply(initial)
    setThemeState(initial)
  }, [])

  const apply = (next: Theme) => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(next)
  }

  const setTheme = useCallback((next: Theme) => {
    apply(next)
    localStorage.setItem("hq-archive-theme", next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return { theme, toggleTheme, mounted }
}
