'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  type: ToastType
  text: string
}

interface ToastContextValue {
  showToast: (type: ToastType, text: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

let nextId = 0

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, text: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-toast-in flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${
              toast.type === 'success'
                ? 'border-emerald-200/60 bg-white/80 text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-900/80 dark:text-emerald-400'
                : 'border-red-200/60 bg-white/80 text-red-700 dark:border-red-800/60 dark:bg-slate-900/80 dark:text-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.text}</span>
            <button type="button" onClick={() => dismiss(toast.id)} className="ml-2 shrink-0 hover:opacity-70">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
