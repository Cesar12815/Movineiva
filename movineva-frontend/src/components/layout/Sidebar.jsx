import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { path: '/',               icon: '🗺️',  label: 'Mapa de Agilidad' },
  { path: '/domicilios',     icon: '📦',  label: 'Mis Entregas'    },
  { path: '/favoritos',      icon: '⭐',  label: 'Sitios Top'       },
  { path: '/reportes',       icon: '⚠️',  label: 'Reportar Zona'    },
  { path: '/admin',          icon: '⚙️',  label: 'Configuración'    },
]

export default function Sidebar({ isOpen, close }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    close()
    navigate('/login')
  }

  return (
    <aside style={{
      width: '260px',
      background: '#111',
      borderRight: '1px solid #333',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 99999,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-out',
      boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
    }}>
      {/* Brand - Domiciliarios Neiva */}
      <div style={{
        padding: '30px 20px',
        borderBottom: '1px solid #222',
        background: '#1a1a1a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 45, height: 45,
            background: '#2563eb',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            📦
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
              MoviNeiva
            </div>
            <div style={{ color: '#2563eb', fontSize: 11, fontWeight: 700 }}>
              {user?.name?.split(' ')[0].toUpperCase() || 'DELIVERY'} PRO
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '15px 10px' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={close}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 15px',
              borderRadius: '10px',
              marginBottom: 5,
              textDecoration: 'none',
              background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
              color: isActive ? '#3b82f6' : '#aaa',
              fontWeight: isActive ? 600 : 400,
              fontSize: 15,
              transition: '0.2s',
            })}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout & Footer */}
      <div style={{ padding: '15px', borderTop: '1px solid #222' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>🚪</span> Cerrar Sesión
        </button>
        <div style={{ textAlign: 'center', color: '#555', fontSize: 10, marginTop: 15 }}>
          v2.8.0 • Neiva, Huila
        </div>
      </div>
    </aside>
  )
}
