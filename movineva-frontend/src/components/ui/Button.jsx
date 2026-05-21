const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))',
    color: '#fff',
    boxShadow: '0 2px 12px var(--brand-glow)',
  },
  secondary: {
    background: 'var(--surface-3)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-bright)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-bright)',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  success: {
    background: 'rgba(34,197,94,0.1)',
    color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.3)',
  },
}

export default function Button({
  children,
  onClick,
  variant  = 'primary',
  disabled = false,
  small    = false,
  full     = false,
  style    = {},
  type     = 'button',
}) {
  const v = VARIANTS[variant] || VARIANTS.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        border: 'none',
        borderRadius: 'var(--r-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: small ? 12 : 14,
        padding: small ? '6px 12px' : '10px 20px',
        transition: 'opacity 0.15s, filter 0.15s',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        width: full ? '100%' : undefined,
        ...v,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.12)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
    >
      {children}
    </button>
  )
}
