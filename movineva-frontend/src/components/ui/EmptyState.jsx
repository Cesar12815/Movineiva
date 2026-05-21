export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '52px 24px',
      textAlign: 'center',
      gap: 12,
    }}>
      <div style={{ fontSize: 44, opacity: 0.7 }}>{icon}</div>
      {title && (
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>{title}</div>
      )}
      {message && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
          {message}
        </div>
      )}
    </div>
  )
}
