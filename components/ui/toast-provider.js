'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const show = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2)
    const toast = {
      id,
      title: opts?.title || '',
      description: opts?.description || '',
      variant: opts?.variant || 'default',
      duration: opts?.duration ?? 3500,
    }
    setToasts((t) => [...t, toast])
    if (toast.duration > 0) setTimeout(() => remove(id), toast.duration)
  }, [remove])

  const value = useMemo(() => ({ show, remove }), [show, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`min-w-[260px] max-w-[360px] rounded-lg border p-3 shadow-xl backdrop-blur bg-neutral-900/90 border-neutral-800 ${t.variant === 'destructive' ? 'border-red-800' : ''}`}>
            {t.title && <div className="font-semibold mb-1">{t.title}</div>}
            {t.description && <div className="text-sm text-neutral-300">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


