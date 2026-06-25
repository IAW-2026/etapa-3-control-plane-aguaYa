'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="flex items-center justify-center rounded-lg border border-white/30 bg-gradient-to-br from-white/30 to-slate-100/30 p-2 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:bg-white/40 dark:border-slate-700/40 dark:from-slate-900/40 dark:to-slate-800/40 dark:hover:bg-white/10"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-300" />
      )}
    </button>
  )
}
