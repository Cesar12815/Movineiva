import { useState, useEffect, useCallback } from 'react'
import { datasetApi } from '../api'
import { useToast } from '../context/ToastContext'

const LOCAL_KEY    = 'movineva_dataset'
const VERSION_KEY  = 'movineva_dataset_version'

export function useDataset() {
  const { toast } = useToast()
  const [remoteVersion, setRemoteVersion] = useState(null)
  const [localVersion,  setLocalVersion]  = useState(() => localStorage.getItem(VERSION_KEY))
  const [downloading,   setDownloading]   = useState(false)
  const [downloaded,    setDownloaded]    = useState(null)

  useEffect(() => {
    datasetApi.getVersion().then(r => {
      if (r.success) setRemoteVersion(r.data)
    }).catch(() => {})
  }, [])

  const needsUpdate = remoteVersion && localVersion && remoteVersion.version !== localVersion

  const download = useCallback(async () => {
    setDownloading(true)
    try {
      const r = await datasetApi.download()
      if (r.success) {
        localStorage.setItem(LOCAL_KEY,   JSON.stringify(r.data))
        localStorage.setItem(VERSION_KEY, r.data.version)
        setLocalVersion(r.data.version)
        setDownloaded(r.data)
        toast(`Dataset v${r.data.version} descargado ✅`, 'success')
      } else {
        toast(r.message || 'Error al descargar', 'error')
      }
    } catch {
      toast('Error de conexión', 'error')
    } finally {
      setDownloading(false)
    }
  }, [toast])

  const getLocalDataset = () => {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  }

  return {
    remoteVersion, localVersion, needsUpdate,
    downloading, downloaded,
    download, getLocalDataset,
  }
}
