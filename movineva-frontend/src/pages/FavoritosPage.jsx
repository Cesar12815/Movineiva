// RF-05: Listar y gestionar rutas favoritas
// RB-03: Máximo 20 favoritos por dispositivo

import { useFavorites } from '../hooks/useFavorites'
import { MAX_FAVORITES, BASE_URL } from '../utils/constants'
import PageHeader   from '../components/ui/PageHeader'
import Card         from '../components/ui/Card'
import Spinner      from '../components/ui/Spinner'
import EmptyState   from '../components/ui/EmptyState'

export default function FavoritosPage() {
  const { favorites, remaining, loading, remove } = useFavorites()

  const used      = favorites.length
  const fillPct   = (used / MAX_FAVORITES) * 100
  const barColor  = used >= 18 ? '#ef4444' : used >= 14 ? '#f59e0b' : '#2563eb'

  return (
    <div style={{ padding: '0 15px' }}>
      <PageHeader
        title="⭐ Sitios Top"
        subtitle={`${used} lugares guardados · ${remaining} libres`}
      />

      <Card style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: '#888' }}>Capacidad de memoria local</span>
          <span style={{ color: barColor, fontWeight: 700 }}>{used} / {MAX_FAVORITES}</span>
        </div>
        <div style={{ background: '#222', borderRadius: 99, height: 7, overflow: 'hidden' }}>
          <div style={{
            background: barColor,
            height: '100%',
            width: `${fillPct}%`,
            borderRadius: 99,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </Card>

      {loading ? <Spinner /> : favorites.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Sin sitios guardados"
          message="Guarda los puntos de entrega donde más trabajas para ver sus fachadas rápido."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {favorites.map(site => (
            <div key={site.id} style={{
              background: '#1a1a1a',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #333'
            }}>
              <div style={{ position: 'relative', height: '140px' }}>
                <img
                  src={`${BASE_URL}${site.photoUrl}`}
                  alt={site.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => remove(site.id)}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                    borderRadius: '50%', width: 35, height: 35, cursor: 'pointer'
                  }}
                >✕</button>
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>{site.name}</h3>
                <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{site.address}</p>
                {site.deliveryInstructions && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    background: '#2563eb22',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#60a5fa'
                  }}>
                    🔔 {site.deliveryInstructions}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
