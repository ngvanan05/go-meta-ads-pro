import { useState, useCallback } from 'react'

export function ConfirmModal({ open, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Huỷ', danger = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="cm-overlay" onClick={onCancel} role="presentation">
      <div className="cm-box" onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title || message}>
        {title && <div className="cm-title">{title}</div>}
        <div className="cm-msg">{message}</div>
        <div className="cm-actions">
          <button className="cm-btn cm-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`cm-btn ${danger ? 'cm-danger' : 'cm-primary'}`} onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>

      <style jsx>{`
        .cm-overlay {
          position: fixed; inset: 0; background: rgba(10,12,20,.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 16px; animation: cmFade .15s ease;
        }
        .cm-box {
          background: var(--s1, #fff); border: 1px solid var(--bd, #e2e8f0);
          border-radius: 14px; padding: 22px 24px; max-width: 380px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,.35); animation: cmPop .15s ease;
        }
        .cm-title { font-size: 15px; font-weight: 700; color: var(--txt, #1e293b); margin-bottom: 8px; }
        .cm-msg { font-size: 13.5px; color: var(--mut, #64748b); line-height: 1.6; margin-bottom: 20px; }
        .cm-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .cm-btn {
          padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; border: none; transition: opacity .15s;
        }
        .cm-cancel { background: var(--s2, #f1f5f9); color: var(--txt, #1e293b); }
        .cm-cancel:hover { opacity: .8; }
        .cm-primary { background: var(--primary, #fe5f01); color: #fff; }
        .cm-primary:hover { opacity: .88; }
        .cm-danger { background: var(--red, #ef4444); color: #fff; }
        .cm-danger:hover { opacity: .88; }
        @keyframes cmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmPop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .cm-overlay, .cm-box { animation: none; }
        }
      `}</style>
    </div>
  )
}

// Hook tiện dụng: confirm(message, opts) trả về Promise<boolean>, thay cho window.confirm()
export function useConfirm() {
  const [state, setState] = useState(null)

  const confirm = useCallback((message, opts = {}) => {
    return new Promise(resolve => {
      setState({ message, ...opts, resolve })
    })
  }, [])

  const handleConfirm = () => { state?.resolve(true); setState(null) }
  const handleCancel = () => { state?.resolve(false); setState(null) }

  const confirmModal = (
    <ConfirmModal
      open={!!state}
      title={state?.title}
      message={state?.message}
      confirmLabel={state?.confirmLabel}
      cancelLabel={state?.cancelLabel}
      danger={state?.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, confirmModal }
}
