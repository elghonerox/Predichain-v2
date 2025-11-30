// components/ThemeToggle.tsx
'use client'

import { useTheme } from '@/hooks/useTheme'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-lg bg-[#1a1f29] border border-[rgba(255,255,255,0.08)]">
                <span className="sr-only">Toggle theme</span>
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-lg bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(99,102,241,0.3)] transition-all duration-200 flex items-center justify-center group overflow-hidden hover-lift"
            aria-label="Toggle theme"
        >
            {/* Sun icon (light mode) */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Moon icon (dark mode) */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>

            {/* Hover effect */}
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#06b6d4] opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
        </button>
    )
}
