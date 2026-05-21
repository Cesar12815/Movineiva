import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      if (res.success) {
        toast('Cuenta creada. ¡Ahora puedes iniciar sesión!', 'success');
        navigate('/login');
      } else {
        toast(res.message || 'Error en el registro', 'error');
      }
    } catch (err) {
      toast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🚌 MoviNeiva</h1>
        <p>Crea tu cuenta para empezar</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cesar Ruiz"
              required
            />
          </div>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? 'Creando cuenta...' : 'Registrarme'}
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
          background: #f1f5f9;
          padding: 20px;
        }
        .auth-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .auth-card h1 { margin-bottom: 10px; color: #1e293b; }
        .auth-card p { color: #64748b; margin-bottom: 30px; }
        .input-group { text-align: left; margin-bottom: 20px; }
        .input-group label { display: block; font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          outline: none;
        }
        .input-group input:focus { border-color: #2563eb; }
        .btn-auth {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #2563eb;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.3s;
        }
        .btn-auth:hover { background: #1d4ed8; }
        .btn-auth:disabled { background: #94a3b8; }
        .auth-footer { margin-top: 20px; font-size: 14px; }
        .auth-footer a { color: #2563eb; font-weight: 600; text-decoration: none; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
