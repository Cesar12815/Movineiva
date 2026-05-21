import { useState, useCallback } from 'react'
import { stopsApi } from '../api'
import { useToast } from '../context/ToastContext'

export function useNearbyStops() {
  const { toast } = useToast()
  const [stops,   setStops]   = useState([])
  const [loading, setLoading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle') // idle | loading | active | error

  const fetch = useCallback(async (lat, lng, radius = 500) => {
    setLoading(true)
    const r = await stopsApi.getNearby(lat, lng, radius)
    if (r.success) {
      setStops(r.data)
      if (r.count === 0) toast(r.message || 'No hay paraderos en ese radio', 'info')
    } else {
      toast(r.message || 'Error al buscar paraderos', 'error')
    }
    setLoading(false)
    return r
  }, [toast])

  const useGPS = useCallback((radius = 500) => {
    if (!navigator.geolocation) {
      toast('GPS no disponible en este navegador', 'error')
      return
    }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsStatus('active')
        fetch(pos.coords.latitude, pos.coords.longitude, radius)
      },
      () => {
        setGpsStatus('error')
        toast('No se pudo obtener la ubicación GPS (RB-01)', 'error')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [fetch, toast])

  return { stops, loading, gpsStatus, fetch, useGPS }
}
