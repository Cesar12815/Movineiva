import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { deliveryApi, reportsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { DEVICE_ID, BASE_URL } from '../utils/constants';
import io from 'socket.io-client';

const DomiciliosPage = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(false);
  const [socket, setSocket] = useState(null);
  const [sites, setSites] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceId] = useState(DEVICE_ID);

  // Gamificación e Inteligencia de Negocio
  const [stats, setStats] = useState({
    points: 2450,
    deliveries: 0,
    rank: 'LEYENDA DEL HUILA',
    earnings: 0,
    target: 120000
  });

  const [recentDeliveries, setRecentDeliveries] = useState([]);

  const [communityNews, setCommunityNews] = useState([]);

  // --- MOTOR DE VOZ AMIGABLE v2.7.0 ---
  const speak = (text) => {
    if (!text || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      // Buscamos una voz más cálida (Google o Natural en Español)
      const friendlyVoice = voices.find(v =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.lang.includes('es-MX')) &&
        v.lang.includes('es')
      );

      if (friendlyVoice) u.voice = friendlyVoice;

      u.lang = 'es-CO';
      u.rate = 0.95;  // Un poquito más lento para sonar humano
      u.pitch = 1.1;   // Un poquito más agudo para sonar amable
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error("Error en voz amigable:", e);
    }
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [sitesRes, reportsRes] = await Promise.all([
        deliveryApi.searchSites(searchName),
        reportsApi.getNearby(2.9333, -75.2872)
      ]);

      setSites(Array.isArray(sitesRes.data) ? sitesRes.data : []);

      if (reportsRes.success) {
        setCommunityNews(reportsRes.data.slice(0, 8).map(r => ({
          id: r.id,
          type: r.type,
          msg: r.description,
          user: r.userName || 'Compañero'
        })));
      }

      // Cargar ganancias reales
      if (deviceId !== 'unknown') {
        const earningsRes = await deliveryApi.getEarnings(deviceId);
        if (earningsRes.success) {
          setStats(prev => ({
            ...prev,
            earnings: earningsRes.data.totalEarnings,
            deliveries: earningsRes.data.deliveryCount
          }));
          setRecentDeliveries(earningsRes.data.recentDeliveries);
        }
      }
    } catch (e) {
      setError("CENTRAL DESCONECTADA");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchName, deviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    newSocket.on('new-report', (report) => {
      setCommunityNews(prev => [
        {
          id: report.id,
          type: report.type,
          msg: report.description,
          user: report.userName || 'Compañero'
        },
        ...prev
      ].slice(0, 8));

      if (report.type === 'POLICE' || report.type === 'DANGER') {
        speak(`Atención equipo: ${report.userName || 'Un compañero'} reportó una novedad: ${report.description}`);
      }
    });

    fetchData();

    // Bienvenida amigable y única
    const hour = new Date().getHours();
    const saludo = hour < 12 ? "¡Buen día" : hour < 18 ? "¡Buenas tardes" : "¡Buena noche";
    const name = authUser?.name?.split(' ')[0] || "Pro";

    if (stats.deliveries > 0) {
      speak(`${saludo} ${name}. Qué alegría verte. Llevas un excelente ritmo con ${stats.deliveries} entregas. ¡Sigue así!`);
    } else {
      speak(`${saludo} ${name}. Bienvenido a tu centro de mando. Hoy vamos a romperla. ¿Listo para la primera entrega?`);
    }

    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, points: prev.points + 1 }));
    }, 15000);

    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, [fetchData]);

  const toggleTracking = () => {
    if (!tracking) {
      setTracking(true);
      speak("Modo en servicio activado. Transmitiendo GPS a la red de agilidad.");
      toast("¡A darle, Pro! Rastreo activo", "success");
    } else {
      setTracking(false);
      speak("Modo descanso activado.");
      toast("Modo Offline", "info");
    }
  };

  return (
    <div className={`pro-container ${tracking ? 'on-duty' : ''}`}>
      <header className="pro-header">
        <div className="user-info">
          <div className="avatar">DP</div>
          <div>
            <h1>Panel de Control</h1>
            <span className="rank-tag">{stats.rank}</span>
          </div>
        </div>
        <button className="btn-map-fab" onClick={() => navigate('/')}>📍 IR AL RADAR</button>
      </header>

      {/* DASHBOARD DE RENDIMIENTO (Totalmente Pro) */}
      <section className="dashboard">
        <div className="main-stat">
          <div className="label">GANANCIAS DEL DÍA</div>
          <div className="value">${stats.earnings.toLocaleString()}</div>
          <div className="progress-container">
            <div className="bar" style={{ width: `${(stats.earnings/stats.target)*100}%` }}></div>
          </div>
          <div className="footer-stat">Meta: ${stats.target.toLocaleString()}</div>
        </div>

        <div className="mini-stats">
          <div className="stat-item">
            <strong>{stats.deliveries}</strong>
            <span>Pedidos</span>
          </div>
          <div className="stat-item">
            <strong>{stats.points}</strong>
            <span>EXP</span>
          </div>
        </div>
      </section>

      {/* RADAR DE COMPAÑEROS (Inteligencia Colectiva) */}
      <section className="radar-feed">
        <h2>📡 RADAR DE COMPAÑEROS</h2>
        <div className="feed-box">
          {communityNews.map(news => (
            <div key={news.id} className={`news-item ${news.type.toLowerCase()}`}>
              <div className="dot"></div>
              <p><strong>@{news.user}:</strong> {news.msg}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HISTORIAL RECIENTE */}
      <section className="recent-deliveries">
        <h2>📦 ÚLTIMAS ENTREGAS</h2>
        <div className="deliveries-list">
          {recentDeliveries.length === 0 && <p className="empty-text">No hay entregas hoy todavía.</p>}
          {recentDeliveries.map(del => (
            <div key={del.id} className="delivery-mini-card">
              <div className="time">{new Date(del.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="client">{del.customerName}</div>
              <div className="amount">+${del.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ESTADO DE CONEXIÓN */}
      <div className={`connection-card ${error ? 'error' : 'ok'}`}>
        <div className="pulse"></div>
        <span>{error || 'Sincronizado con Central Neiva'}</span>
        {error && <button onClick={() => fetchData()}>RECONECTAR</button>}
      </div>

      {/* BUSCADOR Y LISTA */}
      <div className="search-box-pro">
        <input
          type="text"
          placeholder="Buscar cliente en mi base de datos..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      <div className="sites-grid">
        {loading && <div className="loader-pro">ESCANEANDO RED...</div>}
        {!loading && sites.length === 0 && !error && (
          <div className="empty-pro">
            <div className="icon">📦</div>
            <h3>Base de datos vacía</h3>
            <p>Mapea tu primera fachada en el radar para ganar agilidad.</p>
          </div>
        )}
        {sites.map(site => (
          <div key={site.id} className="pro-site-card" onClick={() => navigate('/', { state: { targetSite: site } })}>
            <div className="img-holder">
              {site.photoUrl ? <img src={`${BASE_URL}${site.photoUrl}`} /> : <span>📸</span>}
            </div>
            <div className="info">
              <h4>{site.customerName}</h4>
              <p>📍 {site.address || 'Sin dirección'}</p>
              {site.notes && <div className="note-pill">{site.notes}</div>}
            </div>
            <div className="arrow">→</div>
          </div>
        ))}
      </div>

      {/* BOTÓN DE ACCIÓN FLOTANTE */}
      <button className={`btn-status ${tracking ? 'active' : ''}`} onClick={toggleTracking}>
        {tracking ? 'EN SERVICIO' : 'INICIAR TURNO'}
      </button>

      <style>{`
        .pro-container { padding: 20px; background: #f1f5f9; min-height: 100vh; padding-bottom: 120px; transition: 0.3s; }
        .pro-container.on-duty { background: #eef2ff; }

        .pro-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .user-info { display: flex; gap: 12px; align-items: center; }
        .avatar { width: 45px; height: 45px; background: #111; color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .pro-header h1 { font-size: 18px; font-weight: 900; margin: 0; color: #1e293b; }
        .rank-tag { font-size: 10px; font-weight: 800; background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 5px; }
        .btn-map-fab { background: #111; color: #fff; border: none; padding: 10px 15px; border-radius: 12px; font-size: 11px; font-weight: 800; }

        .dashboard { background: #fff; border-radius: 24px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .main-stat .label { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 5px; }
        .main-stat .value { font-size: 32px; font-weight: 900; color: #2563eb; margin-bottom: 10px; }
        .progress-container { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
        .progress-container .bar { height: 100%; background: #2563eb; border-radius: 4px; }
        .footer-stat { font-size: 11px; color: #94a3b8; font-weight: 700; text-align: right; }

        .mini-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; border-top: 1px solid #f1f5f9; pt: 15px; }
        .stat-item { text-align: center; padding-top: 15px; }
        .stat-item strong { display: block; font-size: 20px; color: #1e293b; }
        .stat-item span { font-size: 11px; color: #64748b; font-weight: 700; }

        .radar-feed { margin-bottom: 20px; }
        .radar-feed h2 { font-size: 12px; font-weight: 900; color: #2563eb; margin-bottom: 12px; }
        .feed-box { background: #111; border-radius: 20px; padding: 15px; }
        .news-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .news-item .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: blink 1s infinite; }
        .news-item.police .dot { background: #ef4444; }
        .news-item.traffic .dot { background: #f59e0b; }
        .news-item.danger .dot { background: #7c3aed; }
        .news-item.road_block .dot { background: #111; border: 1px solid #fff; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .recent-deliveries { margin-bottom: 20px; }
        .recent-deliveries h2 { font-size: 12px; font-weight: 900; color: #1e293b; margin-bottom: 12px; }
        .deliveries-list { background: #fff; border-radius: 20px; padding: 10px; }
        .delivery-mini-card { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .delivery-mini-card:last-child { border-bottom: none; }
        .delivery-mini-card .time { font-size: 10px; color: #94a3b8; font-weight: 700; }
        .delivery-mini-card .client { font-size: 12px; font-weight: 700; color: #1e293b; flex: 1; margin: 0 10px; }
        .delivery-mini-card .amount { font-size: 12px; font-weight: 900; color: #166534; }
        .empty-text { font-size: 11px; color: #94a3b8; text-align: center; padding: 10px; }

        .connection-card { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 15px; margin-bottom: 20px; font-size: 12px; font-weight: 800; }
        .connection-card.ok { background: #dcfce7; color: #166534; }
        .connection-card.error { background: #fee2e2; color: #991b1b; justify-content: space-between; }
        .connection-card.error button { background: #991b1b; color: #fff; border: none; padding: 5px 10px; border-radius: 8px; font-size: 10px; }
        .pulse { width: 10px; height: 10px; border-radius: 50%; background: currentColor; }

        .search-box-pro { margin-bottom: 20px; }
        .search-box-pro input { width: 100%; padding: 15px 20px; border-radius: 15px; border: 2px solid #e2e8f0; outline: none; font-weight: 600; }
        .search-box-pro input:focus { border-color: #2563eb; }

        .pro-site-card { background: #fff; padding: 12px; border-radius: 20px; display: flex; align-items: center; gap: 15px; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .img-holder { width: 60px; height: 60px; border-radius: 12px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .img-holder img { width: 100%; height: 100%; object-fit: cover; }
        .pro-site-card .info { flex: 1; }
        .pro-site-card h4 { margin: 0; font-size: 15px; color: #1e293b; }
        .pro-site-card p { margin: 3px 0; font-size: 11px; color: #64748b; }
        .note-pill { display: inline-block; font-size: 10px; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; color: #2563eb; font-weight: 700; margin-top: 5px; }
        .arrow { color: #cbd5e1; font-weight: 900; }

        .btn-status { position: fixed; bottom: 30px; left: 20px; right: 20px; padding: 20px; border-radius: 24px; border: none; background: #111; color: #fff; font-weight: 900; font-size: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .btn-status.active { background: #ef4444; }
      `}</style>
    </div>
  );
};

export default DomiciliosPage;
