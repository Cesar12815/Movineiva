// RF-09: Reportar paradero incorrecto
// RB-05: Un reporte por paradero por sesión

import { useState, useEffect } from 'react'
import { reportsApi, stopsApi, routesApi } from '../api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { REPORT_TYPES, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../utils/constants'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Input       from '../components/ui/Input'
import Select      from '../components/ui/Select'
import Button      from '../components/ui/Button'
import Badge       from '../components/ui/Badge'

const DEFAULT_FORM = { stopId: '', routeId: '', type: 'TRAFFIC', description: '' }

export default function ReportesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [stops,      setStops]      = useState([])
  const [routes,     setRoutes]     = useState([])
  const [form,       setForm]       = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [sentId,     setSentId]     = useState(null)
  const [status,     setStatus]     = useState(null)

  useEffect(() => {
    // Datos de respaldo inmediatos para que NUNCA salga vacío
    const defaultStops = [
      { id: 's1', name: 'Paradero C.C. San Pedro Plaza' },
      { id: 's2', name: 'Paradero Intercambiador USCO' },
      { id: 's3', name: 'Paradero Terminal de Transportes' },
      { id: 's4', name: 'Paradero Parque Santander' }
    ];
    const defaultRoutes = [
      { id: 'r1', lineNumber: '10', name: 'Ruta Oriente - Centro' },
      { id: 'r2', lineNumber: '20', name: 'Ruta Sur - Canaima' },
      { id: 'r3', lineNumber: '80', name: 'Ruta Circular - Norte' }
    ];

    setStops(defaultStops);
    setRoutes(defaultRoutes);

    const loadData = async () => {
      try {
        const [sr, rr] = await Promise.all([stopsApi.getAll(), routesApi.getAll()])
        if (sr.success && sr.data.length > 0) setStops(sr.data);
        if (rr.success && rr.data.length > 0) setRoutes(rr.data);
      } catch (err) {
        console.error("Error cargando selectores:", err)
      }
    }
    loadData()
  }, [])

  const submit = async () => {
    if (form.description.trim().length < 10) {
      toast('La descripción debe tener al menos 10 caracteres', 'error'); return
    }

    setSubmitting(true)
    try {
      const payload = {
        stopId:      form.stopId  || undefined,
        routeId:     form.routeId || undefined,
        type:        form.type,
        description: form.description.trim(),
        userName:    user?.name || 'Compañero'
      }

      const r = await reportsApi.create(payload)

      if (r.success) {
        toast('Reporte enviado. ¡Gracias por ayudar, Pro! 🚀', 'success')
        setSentId(r.data.id)
        setStatus(null)
        setForm(DEFAULT_FORM)
      } else {
        toast(r.message || 'Error al enviar reporte', 'error')
      }
    } catch (e) {
      toast('Error de conexión con el servidor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const checkStatus = async () => {
    const r = await reportsApi.getStatus(sentId)
    if (r.success) setStatus(r.data)
    else toast('No se pudo obtener el estado', 'error')
  }

  const charCount = form.description.length
  const charOk    = charCount >= 10

  return (
    <div>
      <PageHeader
        title="📝 Reportar Problema"
        subtitle="Ayuda a mantener la información actualizada (RF-09)"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22 }}>

        {/* Form */}
        <Card>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>
            Nuevo reporte ciudadano
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Tipo de problema"
              value={form.type}
              onChange={v => setForm(f => ({ ...f, type: v }))}
              options={REPORT_TYPES}
            />
            <Select
              label="Paradero (opcional)"
              value={form.stopId}
              onChange={v => setForm(f => ({ ...f, stopId: v }))}
              options={[{ value: '', label: '— Selecciona un paradero —' }, ...stops.map(s => ({ value: s.id, label: s.name }))]}
            />
            <Select
              label="Ruta (opcional)"
              value={form.routeId}
              onChange={v => setForm(f => ({ ...f, routeId: v }))}
              options={[{ value: '', label: '— Selecciona una ruta —' }, ...routes.map(r => ({ value: r.id, label: `${r.lineNumber} — ${r.name}` }))]}
            />
            <div>
              <Input
                label="Descripción"
                value={form.description}
                onChange={v => setForm(f => ({ ...f, description: v }))}
                placeholder="Describe el problema con el mayor detalle posible…"
                rows={4}
              />
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                color: charOk ? 'var(--success)' : 'var(--text-muted)',
                fontSize: 11, marginTop: 4,
              }}>
                {charCount} / mínimo 10 caracteres
              </div>
            </div>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </div>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Sent confirmation */}
          {sentId && (
            <Card accent="var(--success)">
              <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>✅ Reporte enviado</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                ID: <code style={{ color: 'var(--brand)', fontSize: 12 }}>{sentId.slice(0, 12)}…</code>
              </div>
              <Button small variant="success" onClick={checkStatus}>Consultar estado</Button>
              {status && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Estado</span>
                    <Badge label={REPORT_STATUS_LABELS[status.status]} color={REPORT_STATUS_COLORS[status.status]} />
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Enviado: {new Date(status.createdAt).toLocaleString('es-CO')}
                  </div>
                  {status.resolvedAt && (
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      Resuelto: {new Date(status.resolvedAt).toLocaleString('es-CO')}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Info: what to report */}
          <Card>
            <div style={{ color: 'var(--brand)', fontWeight: 700, marginBottom: 10 }}>¿Qué puedo reportar?</div>
            {REPORT_TYPES.map(t => (
              <div key={t.value} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0 }}>●</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.label}</span>
              </div>
            ))}
          </Card>

          {/* RB-05 note */}
          <Card accent="var(--info)">
            <div style={{ color: 'var(--info)', fontWeight: 700, marginBottom: 6 }}>ℹ️ Regla RB-05</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              Solo puedes enviar un reporte por paradero en la misma sesión. El equipo revisa cada reporte y actualiza la información en el próximo ciclo de datos.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
