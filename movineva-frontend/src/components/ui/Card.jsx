export default function Card({ children, style = {}, accent }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${accent ? accent + '44' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        ...(accent && { borderLeft: `3px solid ${accent}` }),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
