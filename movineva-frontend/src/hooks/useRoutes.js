import { useState, useEffect } from 'react'
import { routesApi } from '../api'

export function useRoutes() {
  const [routes,  setRoutes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    routesApi.getAll()
      .then(r => {
        if (r.success) setRoutes(r.data)
        else setError(r.message)
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [])

  return { routes, loading, error }
}

export function useRouteDetail(id) {
  const [route,   setRoute]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = (routeId) => {
    setLoading(true)
    routesApi.getById(routeId)
      .then(r => {
        if (r.success) setRoute(r.data)
        else setError(r.message)
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (id) load(id)
  }, [id])

  return { route, loading, error, reload: load }
}
