// AC-02: Panel de administración para el Administrador de datos

import { useState, useEffect, useCallback } from 'react'
import { adminApi, routesApi } from '../api'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../context/ToastContext'
import {
  SERVICE_LABELS, SERVICE_COLORS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS,
} from '../utils/constants'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Input       from '../components/ui/Input'
import Select      from '../components/ui/Select'
import Button      from '../components/ui/Button'
import Badge       from '../components/ui/Badge'
import Spinner     from '../components/ui/Spinner'
import EmptyState  from '../components/ui/EmptyState'

// ─── Login screen ─────────────────────────────────────────────────────
function AdminLogin() {
  const { login } = useAdmin()
  const { toast } = useToast()
  const [key,     setKey]     = useState('')
  const [loading, setLoading] = useState(false)

  const attempt = async () => {
    if (!key.trim()) { toast('Ingresa tu API Key', 'error'); return }
    setLoading(true)
    const r = await adminApi.checkAuth(key.trim())
    if (r.success !== false && !r.message?.includes('autorizado')) {
      login(key.trim())
      toast('Autenticado como administrador ✅', 'success')
    } else {
      toast('API Key inválida o sin autorización', 'error')
    }
    setLoading(false)
  }

  return (
    <div>
      <PageHeader title="⚙️ Administrador" subtitle="Área restringida — requiere API Key (AC-02)" />
      <div style={{ maxWidth: 420 }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 50 }}>🔐</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
              Ingresa tu clave de administrador
            </div>
          </div>
          <Input label="API Key" value={key} onChange={setKey} type="password" placeholder="Tu clave secreta" style={{ marginBottom: 14 }} />
          <Button full onClick={attempt} disabled={loading}>
            {loading ? 'Verificando…' : 'Acceder al panel'}
          </Button>
        </Card>
      </div>
    </div>
  )
}

// ─── Tab: Routes ──────────────────────────────────────────────────────
const ROUTE_FORM_DEFAULT = {
  lineNumber: '', name: '', color: '#E63946',
  serviceType: 'CORRIENTE', fare: '', frequency: '', polyline: '[]',
}

function RoutesTab({ apiKey }) {
  const { toast } = useToast()
  const [routes,   setRoutes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(ROUTE_FORM_DEFAULT)

  const load = () => {
    routesApi.getAll().then(r => {
      if (r.success) setRoutes(r.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      const payload = {
        ...form,
        fare:      parseFloat(form.fare),
        frequency: parseInt(form.frequency),
        polyline:  JSON.parse(form.polyline),
      }
      const r = await adminApi.createRoute(payload, apiKey)
      if (r.success) { toast('Ruta creada ✅', 'success'); setShowForm(false); load() }
      else toast(r.message, 'error')
    } catch { toast('Error al parsear los datos del formulario', 'error') }
  }

  const deactivate = async (id) => {
    const r = await adminApi.deleteRoute(id, apiKey)
    if (r.success) { toast('Ruta desactivada', 'info'); load() }
    else toast(r.message, 'error')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button small onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancelar' : '+ Nueva ruta'}
        </Button>
      </div>

      {showForm && (
        <Card accent="var(--brand)" style={{ marginBottom: 16 }}>
          <div style={{ color: 'var(--brand)', fontWeight: 700, marginBottom: 14 }}>Crear nueva ruta</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Número de línea" value={form.lineNumber} onChange={v => setForm(f => ({ ...f, lineNumber: v }))} placeholder="01" />
            <Input label="Nombre" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ruta Centro — …" />
            <Input label="Color (hex)" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} type="color" />
            <Select label="Tipo de servicio" value={form.serviceType} onChange={v => setForm(f => ({ ...f, serviceType: v }))}
              options={Object.entries(SERVICE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <Input label="Tarifa (COP)" value={form.fare} onChange={v => setForm(f => ({ ...f, fare: v }))} placeholder="2900" type="number" />
            <Input label="Frecuencia (min)" value={form.frequency} onChange={v => setForm(f => ({ ...f, frequency: v }))} placeholder="10" type="number" />
          </div>
          <Input
            label="Polilínea (JSON)"
            value={form.polyline}
            onChange={v => setForm(f => ({ ...f, polyline: v }))}
            placeholder='[{"lat": 2.9344, "lng": -75.2847}, …]'
            rows={3}
            style={{ marginTop: 12 }}
          />
          <div style={{ marginTop: 12 }}><Button small onClick={create}>Crear ruta</Button></div>
        </Card>
      )}

      {loading ? <Spinner /> : routes.length === 0 ? (
        <EmptyState icon="🚌" message="No hay rutas activas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {routes.map(r => (
            <Card key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, background: r.color, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, flexShrink: 0,
                }}>
                  {r.lineNumber}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {SERVICE_LABELS[r.serviceType]} · ${Number(r.fare).toLocaleString('es-CO')} · {r.frequency} min
                  </div>
                </div>
              </div>
              <Button small variant="danger" onClick={() => deactivate(r.id)}>Desactivar</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Reports ─────────────────────────────────────────────────────
function ReportsTab({ apiKey }) {
  const { toast } = useToast()
  const [reports,  setReports]  = useState([])
  const [filter,   setFilter]   = useState('PENDING')
  const [loading,  setLoading]  = useState(true)
  const [pagination, setPagination] = useState({})

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getReports({ status: filter, limit: 20 }, apiKey)
      .then(r => {
        if (r.success) { setReports(r.data); setPagination(r.pagination || {}) }
      })
      .finally(() => setLoading(false))
  }, [filter, apiKey])

  useEffect(() => { load() }, [load])

  const resolve = async (id, newStatus) => {
    const r = await adminApi.resolveReport(id, { status: newStatus, adminNotes: 'Gestionado desde panel admin' }, apiKey)
    if (r.success) { toast(`Reporte marcado como ${REPORT_STATUS_LABELS[newStatus].toLowerCase()}`, 'success'); load() }
    else toast(r.message, 'error')
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface-1)', padding: 4, borderRadius: 'var(--r-md)', width: 'fit-content' }}>
        {Object.entries(REPORT_STATUS_LABELS).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
            background: filter === val ? 'var(--surface-2)' : 'transparent',
            color: filter === val ? REPORT_STATUS_COLORS[val] : 'var(--text-muted)',
            fontWeight: filter === val ? 700 : 400,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.13s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : reports.length === 0 ? (
        <EmptyState icon="📝" message={`No hay reportes ${REPORT_STATUS_LABELS[filter].toLowerCase()}s`} />
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(r => (
              <Card key={r.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 7, marginBottom: 7, flexWrap: 'wrap' }}>
                      <Badge label={r.type.replace('_', ' ')} color="#64748b" />
                      <Badge label={REPORT_STATUS_LABELS[r.status]} color={REPORT_STATUS_COLORS[r.status]} />
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 5 }}>{r.description}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {r.stop?.name  && `📍 ${r.stop.name}  `}
                      {r.route?.name && `🚌 ${r.route.lineNumber} ${r.route.name}  `}
                      · {new Date(r.createdAt).toLocaleString('es-CO')}
                    </div>
                  </div>
                  {['PENDING', 'IN_REVIEW'].includes(r.status) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <Button small variant="success" onClick={() => resolve(r.id, 'RESOLVED')}>✓ Resolver</Button>
                      {r.status === 'PENDING' && <Button small variant="ghost" onClick={() => resolve(r.id, 'IN_REVIEW')}>En revisión</Button>}
                      <Button small variant="danger" onClick={() => resolve(r.id, 'REJECTED')}>✕ Rechazar</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {pagination.total > 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 14 }}>
              {reports.length} de {pagination.total} reportes
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Fares ───────────────────────────────────────────────────────
function FaresTab({ apiKey }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ serviceType: 'CORRIENTE', amount: '', effectiveAt: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.amount || !form.effectiveAt) { toast('Completa todos los campos', 'error'); return }
    setSaving(true)
    const r = await adminApi.upsertFare({
      serviceType: form.serviceType,
      amount:      parseFloat(form.amount),
      effectiveAt: new Date(form.effectiveAt).toISOString(),
    }, apiKey)
    if (r.success) toast('Tarifa actualizada ✅', 'success')
    else toast(r.message, 'error')
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <Card>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 16 }}>Actualizar tarifa vigente</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Tipo de servicio" value={form.serviceType} onChange={v => setForm(f => ({ ...f, serviceType: v }))}
            options={Object.entries(SERVICE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <Input label="Monto (COP)" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} placeholder="2900" type="number" />
          <Input label="Fecha de vigencia" value={form.effectiveAt} onChange={v => setForm(f => ({ ...f, effectiveAt: v }))} type="date" />
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Actualizar tarifa'}</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Tab: Dataset ─────────────────────────────────────────────────────
function DatasetTab({ apiKey }) {
  const { toast } = useToast()
  const [publishing, setPublishing] = useState(false)
  const [description, setDescription] = useState('')

  const publish = async () => {
    setPublishing(true)
    const r = await adminApi.publishDataset({ description: description || 'Actualización desde panel admin' }, apiKey)
    if (r.success) {
      toast(`Dataset publicado: ${r.data.version} ✅`, 'success')
      setDescription('')
    } else toast(r.message, 'error')
    setPublishing(false)
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <Card>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>Publicar nueva versión del dataset</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
          Al publicar, los clientes móviles serán notificados para actualizar su dataset offline.
          La versión anterior quedará desactivada automáticamente.
        </div>
        <Input
          label="Descripción (opcional)"
          value={description}
          onChange={setDescription}
          placeholder="Ej: Actualización de rutas del sector norte"
          style={{ marginBottom: 14 }}
        />
        <Button onClick={publish} disabled={publishing}>
          {publishing ? 'Publicando…' : '📦 Publicar versión'}
        </Button>
      </Card>
    </div>
  )
}

// ─── Main AdminPage ───────────────────────────────────────────────────
const TABS = [
  { id: 'routes',  label: '🚌 Rutas'    },
  { id: 'reports', label: '📝 Reportes' },
  { id: 'fares',   label: '💳 Tarifas'  },
  { id: 'dataset', label: '📦 Dataset'  },
]

export default function AdminPage() {
  const { authenticated, apiKey, logout } = useAdmin()
  const [tab, setTab] = useState('routes')

  if (!authenticated) return <AdminLogin />

  return (
    <div>
      <PageHeader
        title="⚙️ Panel Admin"
        subtitle="Gestión de rutas, reportes, tarifas y dataset (AC-02)"
        action={<Button small variant="ghost" onClick={logout}>Cerrar sesión</Button>}
      />

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 22,
        background: 'var(--surface-1)', padding: 4,
        borderRadius: 'var(--r-md)', width: 'fit-content',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14,
            background: tab === t.id ? 'var(--surface-2)' : 'transparent',
            color: tab === t.id ? 'var(--brand)' : 'var(--text-secondary)',
            fontWeight: tab === t.id ? 700 : 400,
            transition: 'all 0.13s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'routes'  && <RoutesTab  apiKey={apiKey} />}
      {tab === 'reports' && <ReportsTab apiKey={apiKey} />}
      {tab === 'fares'   && <FaresTab   apiKey={apiKey} />}
      {tab === 'dataset' && <DatasetTab apiKey={apiKey} />}
    </div>
  )
}
