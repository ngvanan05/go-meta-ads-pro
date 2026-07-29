import { useState, useCallback } from 'react'

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="toast-msg" role="status" aria-live="polite">
      {toast.msg}
      <style jsx>{`
        .toast-msg {
          position: fixed; top: 16px; right: 16px; z-index: 9998;
          padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
          color: #fff; background: ${toast.type === 'error' ? 'var(--red, #ef4444)' : 'var(--grn, #10b981)'};
          box-shadow: 0 8px 24px rgba(0,0,0,.2); animation: toastIn .3s ease;
        }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .toast-msg { animation: none; } }
      `}</style>
    </div>
  )
}

// Hook tiện dụng: showToast(msg, type) thay cho window.alert()
export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const toastElement = <Toast toast={toast} />

  return { showToast, toastElement }
}
