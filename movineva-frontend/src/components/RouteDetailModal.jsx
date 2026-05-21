import Badge from './ui/Badge'
import Button from './ui/Button'
import Spinner from './ui/Spinner'
import { SERVICE_LABELS, SERVICE_COLORS, formatCOP } from '../utils/constants'

export default function RouteDetailModal({ route, loading, onClose, onReport }) {
  if (!route && !loading) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 28,
          width: '100%',
          maxWidth: 540,
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {loading ? <Spinner /> : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  background: route.color,
                  borderRadius: 'var(--r-md)',
                  padding: '6px 14px',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 20,
                  boxShadow: `0 4px 14px ${route.color}55`,
                }}>
                  {route.lineNumber}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' }}>
                    {route.name}
                  </div>
                  <Badge label={SERVICE_LABELS[route.serviceType]} color={SERVICE_COLORS[route.serviceType]} />
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
              {[
                { label: 'Tarifa',          value: formatCOP(route.fare) },
                { label: 'Frecuencia',      value: `${route.frequency} min` },
                { label: 'Tarifa Nocturna', value: route.nightFare ? formatCOP(route.nightFare) : '—' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: 'var(--brand)', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)' }}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Stops */}
            {route.stops?.length > 0 && (
              <div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}>
                  RECORRIDO — {route.stops.length} PARADEROS
                </div>
                <div>
                  {route.stops.map((stop, i) => (
                    <div key={stop.id} style={{ display: 'flex', gap: 10 }}>
                      {/* Timeline */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: stop.isKeyStop ? route.color : 'var(--surface-3)',
                          border: `2px solid ${stop.isKeyStop ? route.color : 'var(--border-bright)'}`,
                          marginTop: 5, flexShrink: 0, zIndex: 1,
                        }} />
                        {i < route.stops.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 18, background: 'var(--border)', marginTop: 2 }} />
                        )}
                      </div>
                      {/* Stop info */}
                      <div style={{ paddingBottom: 14, flex: 1 }}>
                        <div style={{
                          color: stop.isKeyStop ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: stop.isKeyStop ? 600 : 400,
                          fontSize: 13,
                          display: 'flex', gap: 6, alignItems: 'center',
                        }}>
                          {stop.name}
                          {stop.isKeyStop && (
                            <span style={{ color: route.color, fontSize: 10, fontWeight: 700 }}>CLAVE</span>
                          )}
                        </div>
                        {stop.address && (
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{stop.address}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {onReport && (
                <Button small variant="ghost" onClick={() => onReport(route)}>
                  📝 Reportar problema
                </Button>
              )}
              <Button small variant="ghost" onClick={onClose}>Cerrar</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
