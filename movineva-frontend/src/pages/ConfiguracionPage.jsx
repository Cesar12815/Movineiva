import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiClient } from '../api/client'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function ConfiguracionPage() {
  const { user, login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setLoadingSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    avatarUrl: '',
    secretPin: '',
    config: { voiceVolume: 0.8, alertVolume: 1.0, themeColor: '#2563eb' }
  })

  useEffect(() => {
    apiClient.get('/users/profile')
      .then(res => {
        if (res.success) {
          setProfile(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setLoadingSaving(true)
    try {
      const res = await apiClient.put('/users/config', {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        config: profile.config
      })
      if (res.success) {
        toast('¡Configuración guardada con éxito! ✨', 'success')
        // Actualizamos los datos globales para que persistan al recargar
        login({ ...user, ...res.data }, localStorage.getItem('token'))
      }
    } catch (err) {
      toast('Error al guardar los cambios', 'error')
    } finally {
      setLoadingSaving(false)
    }
  }

  const updateTheme = (color) => {
    setProfile({ ...profile, config: { ...profile.config, themeColor: color } });
    document.documentElement.style.setProperty('--brand', color);
  };

  if (loading) return <div style={{ padding: 20 }}><Spinner /></div>

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 600 }}>
      <PageHeader
        title="👤 Mi Perfil Pro"
        subtitle="Personaliza tu experiencia en MoviNeiva"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Sección de Identidad */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: profile.config.themeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
                overflow: 'hidden',
                border: `4px solid ${profile.config.themeColor}33`
              }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '👤'}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Nombre de Domiciliario"
                value={profile.name}
                onChange={(v) => setProfile({...profile, name: v})}
              />
            </div>
          </div>
          <Input
            label="URL de Foto de Perfil"
            value={profile.avatarUrl}
            onChange={(v) => setProfile({...profile, avatarUrl: v})}
            placeholder="Pega el enlace de tu foto aquí..."
          />
        </Card>

        {/* Sección de Sonido */}
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔊</span> Ajustes de Audio
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Volumen de Asistente (Voz)</span>
              <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{Math.round(profile.config.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.1"
              value={profile.config.voiceVolume}
              onChange={(e) => setProfile({
                ...profile,
                config: { ...profile.config, voiceVolume: parseFloat(e.target.value) }
              })}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Volumen de Alertas de Tráfico</span>
              <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{Math.round(profile.config.alertVolume * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.1"
              value={profile.config.alertVolume}
              onChange={(e) => setProfile({
                ...profile,
                config: { ...profile.config, alertVolume: parseFloat(e.target.value) }
              })}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>
        </Card>

        {/* Sección de Estilo */}
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎨</span> Estilo de la Aplicación
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#ef4444'].map(color => (
              <div
                key={color}
                onClick={() => updateTheme(color)}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: color, cursor: 'pointer',
                  border: profile.config.themeColor === color ? '3px solid white' : 'none',
                  boxShadow: profile.config.themeColor === color ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                  transition: '0.2s'
                }}
              />
            ))}
          </div>
        </Card>

        {/* Sección de Seguridad */}
        <Card accent="var(--warning)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>🔑 Tu Clave Secreta</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 4, color: 'var(--brand)', marginTop: 5 }}>
                {profile.secretPin}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usa esta clave para</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ajustes de sistema</div>
            </div>
          </div>
        </Card>

        <Button full onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios Inolvidables 🚀'}
        </Button>

        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 12,
              textDecoration: 'underline', cursor: 'pointer'
            }}
          >
            Ajustes Avanzados de Sistema
          </button>
        </div>

      </div>
    </div>
  )
}
