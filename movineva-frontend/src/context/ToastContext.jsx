import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

// ─── Toast UI ─────────────────────────────────────────────────────────
const TYPE_STYLES = {
  success: { bg: '#052e16', border: '#22c55e', accent: '#22c55e', icon: '✓' },
  error:   { bg: '#2d0c0c', border: '#ef4444', accent: '#ef4444', icon: '✕' },
  info:    { bg: '#0c1a2d', border: '#3b82f6', accent: '#3b82f6', icon: 'ℹ' },
  warning: { bg: '#1c1400', border: '#f59e0b', accent: '#f59e0b', icon: '⚠' },
}

function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.info
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}44`,
              borderLeft: `3px solid ${s.border}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 260,
              maxWidth: 360,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${s.border}11`,
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'slideInRight 0.22s ease both',
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: s.accent + '22', border: `1px solid ${s.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.accent, fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{s.icon}</span>
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
              {t.message}
            </span>
          </div>
        )
      })}
    </div>
  )
}
