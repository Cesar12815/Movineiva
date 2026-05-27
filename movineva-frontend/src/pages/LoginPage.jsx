import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 🚀 LLAMADA CRÍTICA: Ahora sí llama a LOGIN
      const res = await authApi.login({ email, password });

      if (res.success) {
        login(res.user, res.token);
        toast('¡Bienvenido de nuevo!', 'success');
        navigate('/'); // Al mapa de una vez
      } else {
        toast(res.message || 'Error en credenciales', 'error');
      }
    } catch (err) {
      toast(err.message || 'Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{fontSize: '40px', marginBottom: '10px'}}>💎</div>
        <h1>NeivaPro</h1>
        <p>Inteligencia Colectiva & Agilidad</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
        </p>
      </div>

      <style>{`
        .auth-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; padding: 20px; }
        .auth-card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
        .input-group { text-align: left; margin-bottom: 20px; }
        .input-group label { display: block; font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .input-group input { width: 100%; padding: 14px; border-radius: 12px; border: 2px solid #e2e8f0; outline: none; }
        .btn-auth { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #2563eb; color: white; font-weight: 700; cursor: pointer; }
        .btn-auth:disabled { background: #94a3b8; }
        .auth-footer { margin-top: 20px; font-size: 14px; }
        .auth-footer a { color: #2563eb; font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
};

export default LoginPage;
