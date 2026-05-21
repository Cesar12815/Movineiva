import { useState, useEffect, useCallback } from 'react'
import { favoritesApi } from '../api'
import { useToast } from '../context/ToastContext'

export function useFavorites() {
  const { toast } = useToast()
  const [favorites,  setFavorites]  = useState([])
  const [favIds,     setFavIds]     = useState(new Set())
  const [remaining,  setRemaining]  = useState(20)
  const [loading,    setLoading]    = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    favoritesApi.getAll()
      .then(r => {
        if (r.success) {
          setFavorites(r.data)
          setFavIds(new Set(r.data.map(f => f.id)))
          setRemaining(r.remaining ?? 20)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (siteId) => {
    const r = await favoritesApi.add(siteId)
    if (r.success) {
      toast('Sitio guardado en favoritos ⭐', 'success')
      setFavIds(prev => new Set([...prev, siteId]))
      load()
    } else {
      toast(r.message, 'error')
    }
    return r
  }, [load, toast])

  const remove = useCallback(async (siteId) => {
    const r = await favoritesApi.remove(siteId)
    if (r.success) {
      toast('Sitio eliminado de favoritos', 'info')
      setFavIds(prev => { const s = new Set(prev); s.delete(siteId); return s })
      setFavorites(prev => prev.filter(f => f.id !== siteId))
      setRemaining(prev => prev + 1)
    } else {
      toast(r.message, 'error')
    }
    return r
  }, [toast])

  return { favorites, favIds, remaining, loading, add, remove, reload: load }
}
