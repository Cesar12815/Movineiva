import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AdminProvider }  from './context/AdminContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'

import MapaPage           from './pages/MapaPage'
import FavoritosPage      from './pages/FavoritosPage'
import ReportesPage       from './pages/ReportesPage'
import AdminPage          from './pages/AdminPage'
import DomiciliosPage     from './pages/DomiciliosPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import MensajesPage       from './pages/MensajesPage'
import ConfiguracionPage  from './pages/ConfiguracionPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas Protegidas dentro del Layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/"               element={<MapaPage />} />
                    <Route path="/domicilios"     element={<DomiciliosPage />} />
                    <Route path="/favoritos"      element={<FavoritosPage />} />
                    <Route path="/reportes"       element={<ReportesPage />} />
                    <Route path="/mensajes"       element={<MensajesPage />} />
                    <Route path="/configuracion"  element={<ConfiguracionPage />} />
                    <Route path="/admin"          element={<AdminPage />} />
                    <Route path="*"               element={<Navigate to="/" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
