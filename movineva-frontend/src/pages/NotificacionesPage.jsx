// RF-10: Configurar alertas de salida para rutas favoritas

import { useState, useEffect } from 'react'
import { notificationsApi, routesApi } from '../api'
import { useToast } from '../context/ToastContext'
import { WEEK_DAYS } from '../utils/constants'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Input       from '../components/ui/Input'
import Select      from '../components/ui/Select'
import Button      from '../components/ui/Button'
import Spinner     from '../components/ui/Spinner'
import EmptyState  from '../components/ui/EmptyState'
import Badge       from '../components/ui/Badge'

const DEFAULT_FORM = {
  routeId:     '',
  fcmToken:    'demo-fcm-token-placeholder',
  scheduledAt: '',
  daysOfWeek:  [1, 2, 3, 4, 5],
}

export default function NotificacionesPage() {
  const { toast } = useToast()

  const [notifications, setNotifications] = useState([])
  const [routes,   setRoutes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(DEFAULT_FORM)
  const [saving,   setSaving]   = useState(false)

  const load = () => {
    Promise.all([notificationsApi.getAll(), routesApi.getAll()])
      .then(([nr, rr]) => {
        if (nr.success) setNotifications(nr.data)
        if (rr.success) setRoutes(rr.data)
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter(d => d !== day)
        : [...f.daysOfWeek, day].sort(),
    }))
  }

  const save = async () => {
    if (!form.routeId)     { toast('Selecciona una ruta', 'error'); return }
    if (!form.scheduledAt) { toast('Selecciona la hora de salida', 'error'); return }
    setSaving(true)
    const r = await notificationsApi.create({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    })
    if (r.success) {
      toast('Alerta configurada ✅', 'success')
      setShowForm(false)
      setForm(DEFAULT_FORM)
      load()
    } else {
      toast(r.message, 'error')
    }
    setSaving(false)
  }

  const remove = async (id) => {
    const r = await notificationsApi.remove(id)
    if (r.success) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast('Alerta eliminada', 'info')
    } else toast(r.message, 'error')
  }

  const routeName = (id) => routes.find(r => r.id === id)?.name || 'Ruta'

  return (
    <div>
      <PageHeader
        title="🔔 Alertas de Salida"
        subtitle="Recibe recordatorios antes de que salga tu ruta (RF-10)"
        action={
          <Button small onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancelar' : '+ Nueva alerta'}
          </Button>
        }
      />

      {/* Form */}
      {showForm && (
        <Card accent="var(--brand)" style={{ marginBottom: 22 }}>
          <div style={{ color: 'var(--brand)', fontWeight: 700, marginBottom: 16 }}>Nueva alerta de salida</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Select
              label="Ruta"
              value={form.routeId}
              onChange={v => setForm(f => ({ ...f, routeId: v }))}
              options={[
                { value: '', label: 'Selecciona una ruta…' },
                ...routes.map(r => ({ value: r.id, label: `${r.lineNumber} — ${r.name}` })),
              ]}
            />
            <Input
              label="Hora programada"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={v => setForm(f => ({ ...f, scheduledAt: v }))}
            />
          </div>

          {/* Day picker */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
              DÍAS DE LA SEMANA
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {WEEK_DAYS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    cursor: 'pointer',
                    background: form.daysOfWeek.includes(i) ? 'var(--brand)' : 'var(--surface-3)',
                    color: form.daysOfWeek.includes(i) ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.13s',
                    boxShadow: form.daysOfWeek.includes(i) ? '0 2px 8px var(--brand-glow)' : 'none',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar alerta'}
          </Button>
        </Card>
      )}

      {/* List */}
      {loading ? <Spinner /> : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Sin alertas"
          message="Crea una alerta para que te avisemos antes de que salga tu ruta favorita."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => (
            <Card key={n.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
                    {routeName(n.routeId)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    ⏰ {new Date(n.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {n.daysOfWeek?.map(d => (
                      <span key={d} style={{
                        background: 'var(--brand-subtle)',
                        color: 'var(--brand)',
                        border: '1px solid var(--brand-glow)',
                        padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                      }}>
                        {WEEK_DAYS[d]}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Badge label={n.isActive ? 'Activa' : 'Inactiva'} color={n.isActive ? '#22c55e' : '#64748b'} />
                  <Button small variant="danger" onClick={() => remove(n.id)}>✕</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
