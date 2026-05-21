import { useState } from 'react'
import Sidebar from './Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isMapPage = location.pathname === '/'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>

      {/* TOOLBAR SUPERIOR NATIVA */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '65px',
        background: isMapPage ? 'transparent' : '#111',
        display: 'flex',
        alignItems: 'center',
        padding: '0 15px',
        zIndex: 10000,
        gap: '15px'
      }}>
        {isMapPage ? (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '45px',
              height: '45px',
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            ☰
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ← Volver
          </button>
        )}

        {!isMapPage && <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>MoviNeiva</span>}
      </div>

      {/* Menú Lateral */}
      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />

      {/* Contenido */}
      <main style={{
        flex: 1,
        height: '100vh',
        width: '100%',
        paddingTop: isMapPage ? '0' : '65px',
        overflowY: isMapPage ? 'hidden' : 'auto',
        position: 'relative'
      }}>
        {children}
      </main>

      {/* ELIMINADOR DE FRANJA VERDE ANDROID */}
      <style>{`
        * { outline: none !important; -webkit-tap-highlight-color: transparent !important; }
        *:focus { outline: none !important; }
        .leaflet-container { outline: none !important; }
      `}</style>
    </div>
  )
}
