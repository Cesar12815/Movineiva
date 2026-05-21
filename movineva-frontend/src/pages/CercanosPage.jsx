// RF-03: Paraderos cercanos — con búsqueda por nombre de barrio + GPS
// RB-01: Si no hay GPS, mostrar error descriptivo GPS_REQUIRED

import { useState, useEffect } from 'react'
import { useNearbyStops } from '../hooks/useNearbyStops'
import { stopsApi } from '../api'
import { NEARBY_RADIUS_OPTIONS } from '../utils/constants'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Select      from '../components/ui/Select'
import Button      from '../components/ui/Button'
import Spinner     from '../components/ui/Spinner'
import EmptyState  from '../components/ui/EmptyState'
import Badge       from '../components/ui/Badge'

// Barrios/zonas rápidas de Neiva con coordenadas conocidas
const NEIVA_LOCATIONS = [
  { label: '📍 Selecciona una zona…',            lat: null,     lng: null     },
  { label: 'Centro — Parque Santander',           lat: 2.9344,   lng: -75.2847 },
  { label: 'Centro — Terminal de Transportes',    lat: 2.9273,   lng: -75.2819 },
  { label: 'Centro — Catedral',                   lat: 2.9352,   lng: -75.2857 },
  { label: 'Centro — Hospital HMF',               lat: 2.9312,   lng: -75.2890 },
  { label: 'Norte — La Gaitana / Circunvalar',    lat: 2.9412,   lng: -75.3021 },
  { label: 'Norte — Barrio Comuneros',            lat: 2.9501,   lng: -75.2987 },
  { label: 'Norte — Barrio Timanco',              lat: 2.9478,   lng: -75.2843 },
  { label: 'Norte — Barrio Las Granjas',          lat: 2.9523,   lng: -75.2768 },
  { label: 'Norte — Barrio El Paraíso',           lat: 2.9556,   lng: -75.3010 },
  { label: 'Sur — Universidad Surcolombiana',     lat: 2.9156,   lng: -75.2934 },
  { label: 'Sur — Corhuila',                      lat: 2.9220,   lng: -75.2890 },
  { label: 'Sur — Mercado La Galería',            lat: 2.9178,   lng: -75.2868 },
  { label: 'Sur — Barrio El Jardín',              lat: 2.9089,   lng: -75.2876 },
  { label: 'Sur — Barrio San Pedro Alejandrino',  lat: 2.9045,   lng: -75.2912 },
  { label: 'Oriente — Barrio San Marcos',         lat: 2.9295,   lng: -75.2698 },
  { label: 'Oriente — Zona Industrial',           lat: 2.9190,   lng: -75.2645 },
]

export default function CercanosPage() {
  const { stops, loading, gpsStatus, fetch, useGPS } = useNearbyStops()

  const [radius,       setRadius]       = useState('500')
  const [selectedZone, setSelectedZone] = useState('0')
  const [gpsCoords,    setGpsCoords]    = useState(null)

  const handleZone = (idx) => {
    setSelectedZone(idx)
    const loc = NEIVA_LOCATIONS[parseInt(idx)]
    if (loc && loc.lat) fetch(loc.lat, loc.lng, parseInt(radius))
  }

  const handleGPS = () => {
    setSelectedZone('0')
    setGpsCoords(null)
    useGPS(parseInt(radius), (lat, lng) => setGpsCoords({ lat, lng }))
  }

  const zoneOptions = NEIVA_LOCATIONS.map((l, i) => ({ value: String(i), label: l.label }))

  return (
    <div>
      <PageHeader
        title="📍 Paraderos Cercanos"
        subtitle="Encuentra paraderos próximos usando tu GPS o seleccionando una zona de Neiva"
      />

      <Card style={{ marginBottom: 22 }}>
        {/* Selector de zona */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>
            🗺️ Buscar por zona de Neiva
          </label>
          <Select
            value={selectedZone}
            onChange={handleZone}
            options={zoneOptions}
          />
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <Select
              label="Radio de búsqueda"
              value={radius}
              onChange={setRadius}
              options={NEARBY_RADIUS_OPTIONS}
            />
          </div>
          <Button onClick={handleGPS}>
            {gpsStatus === 'loading' ? '⏳ Obteniendo GPS…' : '📡 Usar mi GPS'}
          </Button>
        </div>

        {gpsStatus === 'active' && gpsCoords && (
          <div style={{ color: 'var(--success)', fontSize: 13 }}>
            ✅ GPS activo — lat {gpsCoords.lat?.toFixed(4)}, lng {gpsCoords.lng?.toFixed(4)}
          </div>
        )}
        {gpsStatus === 'error' && (
          <div style={{ color: 'var(--error)', fontSize: 13 }}>
            ❌ GPS_REQUIRED: activa la ubicación o selecciona una zona del mapa
          </div>
        )}
      </Card>

      {/* Resultados */}
      {loading ? <Spinner /> : stops.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Listo para buscar"
          message="Usa tu GPS o selecciona una zona de Neiva para encontrar paraderos cercanos."
        />
      ) : (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
            {stops.length} paradero{stops.length !== 1 ? 's' : ''} en un radio de{' '}
            {parseInt(radius) < 1000 ? `${radius} m` : `${parseInt(radius) / 1000} km`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stops.map(stop => (
              <Card key={stop.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                      {stop.name}
                    </div>
                    {stop.address && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>{stop.address}</div>
                    )}
                    {stop.zone && <Badge label={stop.zone} color="#64748b" />}

                    {stop.routes?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {stop.routes.map((r, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: r.color + '18',
                            border: `1px solid ${r.color}44`,
                            borderRadius: 6, padding: '3px 8px',
                          }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.color }} />
                            <span style={{ color: r.color, fontSize: 12, fontWeight: 700 }}>{r.lineNumber}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{r.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: 'var(--brand)', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)' }}>
                      {Number(stop.distanceMeters).toLocaleString('es-CO')}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>metros</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
