import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
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
      const res = await authApi.register({ name, email, password });

      if (res.success) {
        // ✅ AUTO-LOGIN: Guardamos los datos y entramos de una vez
        login(res.user, res.token);
        toast('¡Bienvenido a NeivaPro!', 'success');
        navigate('/'); // Vamos al mapa directamente
      } else {
        toast(res.message || 'Error en el registro', 'error');
      }
    } catch (err) {
      // Si el error es que ya existe, avisamos con claridad
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <span style={{fontSize: '40px'}}>💎</span>
          <h1>NeivaPro</h1>
          <p>Únete a la Inteligencia Colectiva</p>
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
          background: #f8fafc;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        .auth-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 420px;
        }
        .logo-section { text-align: center; margin-bottom: 30px; }
        .logo-section h1 { font-size: 28px; color: #1e293b; margin: 10px 0; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .input-group input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          font-size: 16px;
          transition: all 0.3s;
        }
        .input-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); outline: none; }
        .btn-auth {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: #2563eb;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s, background 0.3s;
        }
        .btn-auth:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-auth:active { transform: translateY(0); }
        .btn-auth:disabled { background: #94a3b8; cursor: not-allowed; }
        .auth-footer { text-align: center; margin-top: 25px; color: #64748b; font-size: 14px; }
        .auth-footer a { color: #2563eb; font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
