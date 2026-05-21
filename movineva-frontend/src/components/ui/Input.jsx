import { useState } from 'react'

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  style = {},
  rows,
}) {
  const [focused, setFocused] = useState(false)

  const baseStyle = {
    background: 'var(--surface-1)',
    border: `1px solid ${focused ? 'var(--brand)' : 'var(--border-bright)'}`,
    borderRadius: 'var(--r-md)',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'var(--font-body)',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
          {label.toUpperCase()}
        </label>
      )}
      {rows ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...baseStyle, resize: 'vertical' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
    </div>
  )
}
