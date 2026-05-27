import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [highRes, setHighRes] = useState(() => localStorage.getItem('neivapro_high_res') === 'true');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const toggleResolution = () => {
    const newVal = !highRes;
    setHighRes(newVal);
    localStorage.setItem('neivapro_high_res', String(newVal));
    toast(newVal ? '🚀 Resolución Mejorada Activada' : '🔋 Modo Ahorro de Energía', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.success) {
        login(res.user, res.token);
        toast('¡Bienvenido de nuevo!', 'success');
        navigate('/');
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
    <div className={`auth-container ${highRes ? 'high-res-mode' : ''}`}>
      <div className="auth-card">
        <div className="logo-badge">💎</div>
        <h1>NeivaPro</h1>
        <p className="subtitle">Inteligencia Colectiva & Agilidad</p>

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
            {loading ? 'Entrando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div className="resolution-enhancer">
          <div className="enhancer-label">
            <span>✨ Mejorador de Resolución</span>
            <small>{highRes ? 'Máxima Nitidez' : 'Modo Estándar'}</small>
          </div>
          <button
            type="button"
            onClick={toggleResolution}
            className={`toggle-btn ${highRes ? 'active' : ''}`}
          >
            <div className="toggle-thumb"></div>
          </button>
        </div>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
        </p>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f172a; /* Slate 900 para mejor contraste */
          padding: 20px;
          transition: all 0.3s ease;
        }

        /* Colores más vivos y legibles en móviles */
        .auth-card {
          background: #1e293b; /* Slate 800 */
          padding: 40px 30px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          width: 100%;
          max-width: 400px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .logo-badge {
          font-size: 45px;
          margin-bottom: 15px;
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.4));
        }

        h1 { color: #f8fafc; font-size: 2.2rem; font-weight: 800; margin-bottom: 5px; }
        .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 30px; }

        .input-group { text-align: left; margin-bottom: 22px; }
        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #38bdf8; /* Sky 400 - Alta legibilidad */
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group input {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: 2px solid #334155;
          background: #0f172a;
          color: white;
          outline: none;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          border-color: #38bdf8;
        }

        .btn-auth {
          width: 100%;
          padding: 18px;
          border-radius: 18px;
          border: none;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: white;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
          margin-top: 10px;
        }

        .btn-auth:disabled { opacity: 0.6; }

        /* Mejorador de Resolución */
        .resolution-enhancer {
          margin-top: 30px;
          padding: 15px;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .enhancer-label { text-align: left; }
        .enhancer-label span { display: block; color: #f1f5f9; font-size: 13px; font-weight: 700; }
        .enhancer-label small { color: #64748b; font-size: 11px; }

        .toggle-btn {
          width: 50px;
          height: 26px;
          border-radius: 13px;
          background: #334155;
          position: relative;
          border: none;
          cursor: pointer;
          transition: background 0.3s;
        }

        .toggle-btn.active { background: #38bdf8; }

        .toggle-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.3s;
        }

        .toggle-btn.active .toggle-thumb { transform: translateX(24px); }

        .auth-footer { margin-top: 25px; font-size: 14px; color: #94a3b8; }
        .auth-footer a { color: #38bdf8; font-weight: 700; text-decoration: none; }

        /* Estilos Modo Alta Resolución */
        .high-res-mode {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        .high-res-mode .auth-card {
          box-shadow: 0 0 40px rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .high-res-mode h1 { text-shadow: 0 0 15px rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default LoginPage;
