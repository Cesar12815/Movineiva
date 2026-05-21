export default function Spinner({ size = 32, centered = true }) {
  const el = (
    <div
      style={{
        width:  size,
        height: size,
        border: `3px solid var(--border-bright)`,
        borderTopColor: 'var(--brand)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )

  if (!centered) return el

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
      {el}
    </div>
  )
}
