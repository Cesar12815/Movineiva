// RF-02: Búsqueda por dirección exacta de Neiva + geocodificación Nominatim
// Para domiciliarios: escribe "Cra 5 # 10-43" o "Cll 21 con Cra 8" y el sistema
// resuelve qué ruta tomar y en qué paradero subir y bajar.

import { useState, useRef, useEffect, useCallback } from 'react'
import { routesApi } from '../api'
import { useToast }  from '../context/ToastContext'
import { formatCOP } from '../utils/constants'
import PageHeader       from '../components/ui/PageHeader'
import Card             from '../components/ui/Card'
import Button           from '../components/ui/Button'
import Spinner          from '../components/ui/Spinner'
import EmptyState       from '../components/ui/EmptyState'
import RouteDetailModal from '../components/RouteDetailModal'

// ─── Geocodificación client-side directa a Nominatim ────────────────────────
// Se llama solo para mostrar preview en tiempo real; la búsqueda real va al backend
async function nominatimSuggest(text) {
  if (text.length < 3) return []
  const normalized = text
    .replace(/\bCra\.?\s*/gi, 'Carrera ')
    .replace(/\bCll\.?\s*/gi, 'Calle ')
    .replace(/\bAv\.?\s*/gi,  'Avenida ')
    .replace(/#\s*/g, '')
    .trim()

  const q = normalized.includes('Neiva') ? normalized : `${normalized}, Neiva, Huila`

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q, format: 'json', limit: '5', countrycodes: 'co',
        viewbox: '-75.34,2.86,-75.22,2.97', bounded: '1',
      }),
      { headers: { 'User-Agent': 'MoviNeiva/2.0', 'Accept-Language': 'es' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map(r => ({
      display: r.display_name.split(',').slice(0, 3).join(', '),
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }))
  } catch { return [] }
}

// ─── Colores y badges de tipo de servicio ───────────────────────────────────
const SERVICE_BADGE = {
  CORRIENTE: { bg: '#22c55e22', color: '#16a34a', label: 'Corriente' },
  EJECUTIVO: { bg: '#3b82f622', color: '#2563eb', label: 'Ejecutivo' },
  NOCTURNO:  { bg: '#8b5cf622', color: '#7c3aed', label: 'Nocturno'  },
}

// ─── Campo de dirección con sugerencias Nominatim ───────────────────────────
function AddressInput({ label, icon, placeholder, value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]               = useState(false)
  const [checking, setChecking]       = useState(false)
  const [valid, setValid]             = useState(null) // null | true | false
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const close = e => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleChange = (val) => {
    onChange(val)
    setValid(null)
    clearTimeout(debounceRef.current)
    if (val.length < 4) { setSuggestions([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setChecking(true)
      const sugg = await nominatimSuggest(val)
      setSuggestions(sugg)
      setOpen(sugg.length > 0)
      setValid(sugg.length > 0)
      setChecking(false)
    }, 600)
  }

  const pick = (item) => {
    onChange(item.display)
    setValid(true)
    setOpen(false)
    setSuggestions([])
  }

  const borderColor = valid === true ? '#22c55e' : valid === false ? '#ef4444' : open ? 'var(--brand)' : 'var(--border-bright)'

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>
        {icon} {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--surface-1)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        transition: 'border-color 0.15s',
      }}>
        <input
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', padding: '11px 12px',
            fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
          }}
        />
        <span style={{ padding: '0 10px', fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
          {checking ? '🔍' : valid === true ? '✅' : valid === false ? '❓' : ''}
        </span>
      </div>

      {/* Sugerencias dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
          borderRadius: 'var(--r-md)', boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 12px 4px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            📍 Resultados en Neiva
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => pick(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 12px', background: 'none', border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ color: 'var(--brand)', marginRight: 6 }}>📍</span>
              {s.display}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Card de resultado de ruta ────────────────────────────────────────────────
function RouteResultCard({ r, onDetail }) {
  const svc = SERVICE_BADGE[r.serviceType] || SERVICE_BADGE.CORRIENTE

  return (
    <Card style={{ borderLeft: `4px solid ${r.color}` }}>
      {/* Cabecera: número, nombre, precio */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            background: r.color, borderRadius: 8,
            padding: '6px 12px', color: '#fff',
            fontWeight: 900, fontSize: 16,
            boxShadow: `0 3px 12px ${r.color}66`, flexShrink: 0,
          }}>
            {r.lineNumber}
          </div>
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{r.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: svc.bg, color: svc.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                {svc.label}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>⏱ ~{r.estimatedTime} min</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>🔄 cada {r.frequency} min</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: 'var(--brand)', fontWeight: 900, fontSize: 20 }}>{formatCOP(r.fare)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>tarifa</div>
        </div>
      </div>

      {/* Instrucciones de abordaje y bajada */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14,
      }}>
        {r.boarding && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>
              🟢 SUBE EN
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{r.boarding.name}</div>
            {r.boarding.address && (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{r.boarding.address}</div>
            )}
            <div style={{ color: '#22c55e', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
              🚶 {r.boarding.walkMeters} m a pie
            </div>
          </div>
        )}
        {r.alighting && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>
              🔴 BAJA EN
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{r.alighting.name}</div>
            {r.alighting.address && (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{r.alighting.address}</div>
            )}
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
              🚶 {r.alighting.walkMeters} m a pie
            </div>
          </div>
        )}
      </div>

      {/* Paradas clave */}
      {r.keyStops?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
          {r.keyStops.map((s, i) => (
            <span key={i} style={{ background: 'var(--surface-1)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Button small variant="ghost" onClick={() => onDetail(r)}>Ver recorrido completo</Button>
      </div>
    </Card>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function BuscarPage() {
  const { toast } = useToast()
  const [origin,  setOrigin]  = useState('')
  const [dest,    setDest]    = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detail,  setDetail]  = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const swap = () => { setOrigin(dest); setDest(origin); setResults(null) }

  const search = async () => {
    if (!origin.trim() || !dest.trim()) {
      toast('Escribe el origen y el destino para buscar', 'error')
      return
    }
    setLoading(true)
    setResults(null)
    try {
      const r = await routesApi.search(origin.trim(), dest.trim())
      setResults(r)
      if (r.geocodeError) toast(r.message, 'error')
    } catch {
      toast('Error de conexión con el servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const viewDetail = async (route) => {
    setDetailLoading(true)
    setDetail({})
    const r = await routesApi.getById(route.id)
    if (r.success) setDetail(r.data)
    else { setDetail(null); toast(r.message, 'error') }
    setDetailLoading(false)
  }

  // Ejemplos reales de Neiva para el usuario
  const EXAMPLES = [
    { o: 'Barrio Galán',           d: 'CC San Pedro Plaza' },
    { o: 'Terminal de Transportes', d: 'USCO Norte' },
    { o: 'Ipanema',                d: 'Parque Santander' },
    { o: 'Limonar',                d: 'CC Unicentro' },
  ]

  return (
    <div>
      <PageHeader
        title="🔍 Buscar Ruta"
        subtitle="Escribe la dirección exacta de Neiva — Cra, Calle, Avenida, Diagonal"
      />

      {/* Ejemplos rápidos */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
          EJEMPLOS RÁPIDOS
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setOrigin(ex.o); setDest(ex.d); setResults(null) }}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '5px 14px',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {ex.o.split(',')[0]} → {ex.d.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'end', marginBottom: 14 }}>
          <AddressInput
            label="Origen (dirección de recogida)"
            icon="🟢"
            placeholder="Ej: Cra 8 # 15-32  o  Cll 21 con Cra 5"
            value={origin}
            onChange={setOrigin}
          />
          {/* Swap */}
          <button
            onClick={swap}
            title="Intercambiar origen y destino"
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
              borderRadius: 'var(--r-md)', padding: '11px 12px',
              cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18,
              alignSelf: 'flex-end',
            }}
          >
            ⇄
          </button>
          <AddressInput
            label="Destino (dirección de entrega)"
            icon="🔴"
            placeholder="Ej: Av. Circunvalar # 38-20  o  Barrio El Paraíso"
            value={dest}
            onChange={setDest}
          />
        </div>

        <Button onClick={search} disabled={loading} style={{ width: '100%' }}>
          {loading ? '⏳ Buscando rutas…' : '🚌 Buscar ruta'}
        </Button>

        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
          💡 Acepta <strong>Cra, Cll, Av, Diag, Trans</strong> · Con # o con la palabra <em>con</em> · También nombres de barrios o puntos de referencia
        </p>
      </Card>

      {/* Resultados */}
      {loading && <Spinner />}

      {results && !loading && (
        <>
          {/* Direcciones resueltas */}
          {(results.originResolved || results.destinationResolved) && (
            <div style={{
              background: 'var(--surface-1)', borderRadius: 'var(--r-md)',
              padding: '10px 14px', marginBottom: 16, fontSize: 12,
              color: 'var(--text-muted)', borderLeft: '3px solid var(--brand)',
            }}>
              <div>📍 <strong>Origen:</strong> {results.originResolved}</div>
              <div>📍 <strong>Destino:</strong> {results.destinationResolved}</div>
            </div>
          )}

          {/* Error de geocodificación */}
          {results.geocodeError && (
            <Card>
              <EmptyState icon="🗺️" title="Dirección no encontrada" message={results.message} />
              {results.hints && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>FORMATOS VÁLIDOS:</div>
                  {results.hints.map((h, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {h}</div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Sin rutas directas */}
          {!results.geocodeError && results.count === 0 && (
            <Card>
              <EmptyState
                icon="🚌"
                title="Sin ruta directa"
                message={results.message || 'No encontramos una ruta directa. Puede necesitar transbordo.'}
              />
              {(results.boardingStop || results.closestStopOrigin) && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                  El paradero más cercano al origen es: <strong>{(results.boardingStop || results.closestStopOrigin)?.name}</strong>
                  {' '}({Math.round((results.boardingStop || results.closestStopOrigin)?.dist || 0)} m)
                </div>
              )}
            </Card>
          )}

          {/* Rutas encontradas */}
          {!results.geocodeError && results.count > 0 && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
                {results.count} ruta{results.count !== 1 ? 's' : ''} directa{results.count !== 1 ? 's' : ''} encontrada{results.count !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.data.map(r => (
                  <RouteResultCard key={r.id} r={r} onDetail={viewDetail} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {detail !== null && (
        <RouteDetailModal
          route={detail && Object.keys(detail).length ? detail : null}
          loading={detailLoading}
          onClose={() => { setDetail(null); setDetailLoading(false) }}
        />
      )}
    </div>
  )
}
