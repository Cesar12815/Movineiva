import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { SERVICE_LABELS, SERVICE_COLORS, formatCOP } from '../utils/constants'

export default function RouteCard({ route, onView, onFavorite, onRemoveFav, isFav }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        {/* Left: line chip + name */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <div style={{
            background: route.color || 'var(--brand)',
            borderRadius: 'var(--r-md)',
            padding: '5px 11px',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 15,
            minWidth: 44,
            textAlign: 'center',
            flexShrink: 0,
            boxShadow: `0 3px 10px ${route.color}55`,
          }}>
            {route.lineNumber}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {route.name}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <Badge
                label={SERVICE_LABELS[route.serviceType] || route.serviceType}
                color={SERVICE_COLORS[route.serviceType] || '#64748b'}
              />
              <Badge label={`${route.frequency} min`} color="#64748b" />
            </div>
          </div>
        </div>

        {/* Right: fare */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: 'var(--brand)', fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-display)' }}>
            {formatCOP(route.fare)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>por trayecto</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {onView && (
          <Button small variant="ghost" onClick={() => onView(route)}>
            Ver detalles
          </Button>
        )}
        {onFavorite && !isFav && (
          <Button small variant="ghost" onClick={() => onFavorite(route.id)}>
            ⭐ Guardar
          </Button>
        )}
        {onRemoveFav && isFav && (
          <Button small variant="danger" onClick={() => onRemoveFav(route.id)}>
            ✕ Quitar
          </Button>
        )}
        {isFav && !onRemoveFav && (
          <span style={{ color: '#f59e0b', fontSize: 12, alignSelf: 'center' }}>⭐ En favoritos</span>
        )}
      </div>
    </Card>
  )
}
