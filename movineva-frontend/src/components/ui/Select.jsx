export default function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
          {label.toUpperCase()}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--r-md)',
          color: 'var(--text-primary)',
          padding: '10px 14px',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
