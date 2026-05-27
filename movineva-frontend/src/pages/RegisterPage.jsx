import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
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
      const res = await authApi.register({ name, email, password });

      if (res.success) {
        login(res.user, res.token);
        toast('¡Bienvenido a NeivaPro!', 'success');
        navigate('/');
      } else {
        toast(res.message || 'Error en el registro', 'error');
      }
    } catch (err) {
      const msg = err.message || 'Error de conexión';
      toast(msg, 'error');
      if (msg.includes('ya está registrado')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${highRes ? 'high-res-mode' : ''}`}>
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo-badge">💎</div>
          <h1>NeivaPro</h1>
          <p className="subtitle">Únete a la Inteligencia Colectiva</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cesar Ruiz"
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cesar@ejemplo.com"
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
              placeholder="Crea una clave segura"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? 'Procesando...' : 'Registrarme y Entrar'}
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
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f172a; /* Slate 900 */
          padding: 20px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .auth-card {
          background: #1e293b; /* Slate 800 */
          padding: 40px 30px;
          border-radius: 30px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          width: 100%;
          max-width: 420px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .logo-section { margin-bottom: 30px; }
        .logo-badge {
          font-size: 45px;
          margin-bottom: 10px;
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.4));
        }
        .logo-section h1 { font-size: 2.2rem; color: #f8fafc; font-weight: 800; margin: 10px 0; }
        .subtitle { color: #94a3b8; font-size: 1rem; }

        .input-group { text-align: left; margin-bottom: 20px; }
        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #38bdf8; /* Sky 400 */
          margin-bottom: 8px;
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
          font-size: 16px;
          outline: none;
          transition: all 0.3s;
        }

        .input-group input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
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
          transition: transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
        }

        .btn-auth:hover { transform: translateY(-1px); }
        .btn-auth:active { transform: translateY(0); }
        .btn-auth:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Mejorador de Resolución */
        .resolution-enhancer {
          margin-top: 25px;
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

        .auth-footer { text-align: center; margin-top: 25px; color: #94a3b8; font-size: 14px; }
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
      `}</style>
    </div>
  );
};

export default RegisterPage;
