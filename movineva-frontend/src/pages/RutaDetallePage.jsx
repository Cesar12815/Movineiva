import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { routesApi } from '../api'
import { useToast } from '../context/ToastContext'
import { SERVICE_LABELS, formatCOP } from '../utils/constants'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

export default function RutaDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    routesApi.getById(id)
      .then(res => {
        if (res.success) setRoute(res.data)
        else {
          toast(res.message, 'error')
          navigate('/rutas')
        }
      })
      .catch(() => toast('Error al cargar detalle', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spinner /></div>
  if (!route) return null

  return (
    <div className="page-fade-in" style={{ padding: '16px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '10px' }}>
        ← Volver
      </button>

      <PageHeader
        title={`Ruta ${route.lineNumber}`}
        subtitle={route.name}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '10px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <Badge color={route.color}>{SERVICE_LABELS[route.serviceType]}</Badge>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {formatCOP(route.fare)}
            </span>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            ⏱️ Frecuencia aprox: <strong>{route.frequency} min</strong>
          </div>

          <h4 style={{ marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>📍 Paraderos Clave</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {route.stops.map((s, idx) => (
              <div key={s.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: route.color, marginTop: '4px' }}></div>
                  {idx !== route.stops.length - 1 && <div style={{ width: '2px', height: '30px', background: '#333' }}></div>}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: '#777' }}>{s.address}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
