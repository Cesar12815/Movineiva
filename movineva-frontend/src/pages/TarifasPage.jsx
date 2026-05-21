// RF-08: Ver tarifas actualizadas por tipo de servicio

import { useState, useEffect } from 'react'
import { faresApi } from '../api'
import { SERVICE_ICONS, SERVICE_LABELS } from '../utils/constants'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Spinner     from '../components/ui/Spinner'
import EmptyState  from '../components/ui/EmptyState'

export default function TarifasPage() {
  const [fares,   setFares]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    faresApi.getAll()
      .then(r => { if (r.success) setFares(r.data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="💳 Tarifas"
        subtitle="Tabla de tarifas vigentes por tipo de servicio (RF-08)"
      />

      {loading ? <Spinner /> : fares.length === 0 ? (
        <EmptyState icon="💳" message="No hay tarifas disponibles actualmente." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
            {fares.map(f => (
              <Card key={f.id} style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 46, marginBottom: 14 }}>
                  {SERVICE_ICONS[f.serviceType] || '🚌'}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                }}>
                  {f.label?.toUpperCase()}
                </div>
                <div style={{
                  color: 'var(--brand)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 38,
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  ${Number(f.amount).toLocaleString('es-CO')}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>COP por trayecto</div>
                <div style={{
                  marginTop: 16,
                  color: 'var(--text-faint)',
                  fontSize: 11,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12,
                }}>
                  Vigente desde {new Date(f.effectiveAt).toLocaleDateString('es-CO')}
                </div>
              </Card>
            ))}
          </div>

          <Card accent="var(--brand)">
            <div style={{ color: 'var(--brand)', fontWeight: 700, marginBottom: 8 }}>
              ℹ️ Sobre las tarifas
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Las tarifas son establecidas por la Secretaría de Tránsito de Neiva y pueden actualizarse periódicamente.
              El servicio <strong style={{ color: 'var(--text-primary)' }}>Nocturno</strong> opera desde las 10 PM hasta las 5 AM.
              El servicio <strong style={{ color: 'var(--text-primary)' }}>Ejecutivo</strong> ofrece unidades de mayor comodidad y capacidad.
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
