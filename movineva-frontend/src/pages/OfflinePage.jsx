// RF-06: Consultar rutas sin conexión
// RB-02: Debe descargarse al menos una vez con conexión activa

import { useDataset } from '../hooks/useDataset'
import PageHeader  from '../components/ui/PageHeader'
import Card        from '../components/ui/Card'
import Button      from '../components/ui/Button'

export default function OfflinePage() {
  const {
    remoteVersion, localVersion, needsUpdate,
    downloading, downloaded, download,
  } = useDataset()

  return (
    <div>
      <PageHeader
        title="📥 Modo Offline"
        subtitle="Descarga el dataset para usar la app sin conexión (RF-06 / RB-02)"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

        {/* Left: versions + download */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
              VERSIÓN EN SERVIDOR
            </div>
            {remoteVersion ? (
              <>
                <div style={{
                  color: 'var(--brand)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 22,
                }}>
                  {remoteVersion.version}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  Publicado: {new Date(remoteVersion.publishedAt).toLocaleString('es-CO')}
                </div>
                {remoteVersion.description && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                    {remoteVersion.description}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sin conexión con el servidor</div>
            )}
          </Card>

          <Card accent={localVersion ? 'var(--success)' : 'var(--error)'}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
              DATASET LOCAL
            </div>
            {localVersion ? (
              <>
                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 15 }}>✅ {localVersion}</div>
                {needsUpdate && (
                  <div style={{ color: 'var(--warning)', fontSize: 13, marginTop: 6 }}>
                    ⚠️ Hay una versión más nueva disponible
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--error)', fontSize: 14 }}>
                ❌ No descargado — necesario para modo offline (RB-02)
              </div>
            )}
          </Card>

          <Button onClick={download} disabled={downloading} full>
            {downloading
              ? '⏳ Descargando…'
              : needsUpdate
                ? '⬇️ Actualizar dataset'
                : '⬇️ Descargar dataset'}
          </Button>
        </div>

        {/* Right: summary + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {downloaded && (
            <Card accent="var(--success)">
              <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12 }}>📦 Dataset descargado</div>
              {[
                { label: 'Rutas',      value: downloaded.routes?.length,      icon: '🚌' },
                { label: 'Paraderos',  value: downloaded.stops?.length,       icon: '📍' },
                { label: 'Relaciones', value: downloaded.routeStops?.length,  icon: '🔗' },
                { label: 'Tarifas',    value: downloaded.fares?.length,       icon: '💳' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.icon} {item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </Card>
          )}

          <Card>
            <div style={{ color: 'var(--brand)', fontWeight: 700, marginBottom: 8 }}>¿Para qué sirve?</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
              Al descargar el dataset puedes consultar rutas, paraderos y tarifas{' '}
              <strong style={{ color: 'var(--text-primary)' }}>sin conexión a internet</strong>.
              El archivo incluye toda la información necesaria para navegar la app con datos móviles apagados.
            </div>
          </Card>

          <Card accent="var(--warning)">
            <div style={{ color: 'var(--warning)', fontWeight: 700, marginBottom: 6 }}>⚠️ Regla RB-02</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              Debes descargar el dataset al menos una vez con conexión activa antes de usar el modo offline.
              Recuerda actualizarlo cuando haya una nueva versión disponible.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
