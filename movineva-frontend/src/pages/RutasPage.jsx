// RF-01: Ver todas las rutas activas
// RF-04: Detalle de una ruta
// RF-05: Guardar como favorito

import { useState } from 'react'
import { routesApi } from '../api'
import { useToast } from '../context/ToastContext'
import { useRoutes } from '../hooks/useRoutes'
import { useFavorites } from '../hooks/useFavorites'
import PageHeader   from '../components/ui/PageHeader'
import Spinner      from '../components/ui/Spinner'
import EmptyState   from '../components/ui/EmptyState'
import RouteCard    from '../components/RouteCard'
import RouteDetailModal from '../components/RouteDetailModal'

export default function RutasPage() {
  const { toast } = useToast()
  const { routes, loading } = useRoutes()
  const { favIds, add: addFav } = useFavorites()
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const viewDetail = async (route) => {
    setDetail({})
    setDetailLoading(true)
    const r = await routesApi.getById(route.id)
    if (r.success) setDetail(r.data)
    else { setDetail(null); toast(r.message, 'error') }
    setDetailLoading(false)
  }

  return (
    <div>
      <PageHeader
        title="🚌 Rutas"
        subtitle={loading ? 'Cargando…' : `${routes.length} rutas activas en Neiva`}
      />

      {loading ? <Spinner /> : routes.length === 0 ? (
        <EmptyState icon="🚌" title="Sin rutas" message="No hay rutas activas disponibles." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routes.map(r => (
            <RouteCard
              key={r.id}
              route={r}
              onView={viewDetail}
              onFavorite={addFav}
              isFav={favIds.has(r.id)}
            />
          ))}
        </div>
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
