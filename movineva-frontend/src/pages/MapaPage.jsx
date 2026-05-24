import { useState, useEffect, useRef, useCallback, Component } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet'
import { useNavigate, useLocation } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useToast } from '../context/ToastContext'
import { Camera, CameraResultType } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { deliveryApi, reportsApi } from '../api'
import { BASE_URL } from '../utils/constants'
import io from 'socket.io-client'

// Icono para sitios ya mapeados por la comunidad
const communitySiteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Pin Estilo Delivery Pro (Azul)
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icono del Repartidor (Moto/Punto Rojo)
const motorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Estilos para marcadores de alerta (DivIcon) mejorados
const getAlertIcon = (type) => {
  let emoji = '⚠️';
  let color = '#ef4444';

  switch(type) {
    case 'POLICE': emoji = '🚓'; color = '#3b82f6'; break;
    case 'TRAFFIC': emoji = '🚗'; color = '#f59e0b'; break;
    case 'DANGER': emoji = '🔥'; color = '#7c3aed'; break;
    case 'ROAD_BLOCK': emoji = '🚫'; color = '#111'; break;
  }

  return L.divIcon({
    className: 'custom-alert-marker',
    html: `<div class="alert-marker-pulse" style="background-color: ${color}">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="error-screen">Recuperando GPS...</div>;
    return this.props.children;
  }
}

function MapEvents({ onClick, onMoveEnd }) {
  useMapEvents({
    click: (e) => onClick(e.latlng),
    moveend: (e) => onMoveEnd(e.target.getCenter())
  });
  return null;
}

function CameraControl({ center, isNavigating }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], isNavigating ? 18 : 16, { animate: true });
    }
  }, [center, isNavigating, map]);
  return null;
}

import { useFavorites } from '../hooks/useFavorites'
import { DEVICE_ID } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

// ... (dentro de MapaPage)
export default function MapaPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { add: addToFavs, favIds } = useFavorites()
  const navigate = useNavigate()
  // ...
  const [placeName, setPlaceName] = useState('')
  const [description, setDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sheetHeight, setSheetHeight] = useState(15)
  const [photo, setPhoto] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [nearbySites, setNearbySites] = useState([]) // Sitios ya mapeados en la zona
  const [nearbyReports, setNearbyReports] = useState([]) // Alertas de tráfico/peligro
  const [userCoords, setUserCoords] = useState(null)
  const [targetSite, setTargetSite] = useState(null) // Sitio específico seleccionado (con foto/notas)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [radarVisible, setRadarVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [reportModal, setReportModal] = useState(null) // { lat, lng }
  const [deviceId, setDeviceId] = useState('unknown')

  const isDragging = useRef(false)
  const watchId = useRef(null)
  const radarTriggered = useRef(false)
  const centerNeiva = [2.9333, -75.2872]
  const API_BASE_URL = BASE_URL; // Dinámico para emulador o web

  // --- MOTOR DE VOZ AMIGABLE (Edición v2.8.0) ---
  const speak = (text) => {
    if (!text || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Esperar a que las voces carguen y buscar una voz cálida
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(v =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('México')) &&
        v.lang.includes('es')
      );

      if (friendlyVoice) utterance.voice = friendlyVoice;

      utterance.lang = 'es-CO';
      utterance.rate = 0.92; // Más pausado y humano
      utterance.pitch = 1.1; // Tono más amable y menos plano

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS Human Error:", e);
    }
  };

  // Cargar sitios y reportes cercanos cuando el mapa se mueve
  const loadNearbyData = async (center) => {
    if (!center) return;
    try {
      console.log('📡 [RADAR] Sincronizando alertas y sitios en:', center);
      const [sitesRes, reportsRes] = await Promise.all([
        deliveryApi.getNearbySites(center.lat, center.lng, 1500),
        reportsApi.getNearby(center.lat, center.lng, 2000)
      ]);
      setNearbySites(sitesRes.data || []);

      if (reportsRes.success) {
        console.log(`✅ [RADAR] ${reportsRes.data.length} alertas cargadas`);
        setNearbyReports(prev => {
          // Fusionar alertas nuevas con las existentes evitando duplicados por ID
          const existingIds = new Set(prev.map(r => r.id));
          const newReports = reportsRes.data.filter(r => !existingIds.has(r.id));
          return [...newReports, ...prev].slice(0, 100); // Mantener máximo 100
        });
      }
    } catch (e) {
      console.error("❌ Error cargando datos del radar:", e);
    }
  };

  useEffect(() => {
    loadNearbyData({ lat: centerNeiva[0], lng: centerNeiva[1] });
    setDeviceId(DEVICE_ID);

    // Configurar Socket para alertas en tiempo real
    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socket.on('connect', () => console.log('✅ Radar conectado vía Sockets'));

    socket.on('new-report', (report) => {
      console.log('📢 Nueva alerta recibida:', report);

      setNearbyReports(prev => {
        // Evitar duplicados
        if (prev.some(r => r.id === report.id)) return prev;

        return [{
          ...report,
          latitude: Number(report.latitude),
          longitude: Number(report.longitude),
          type: String(report.type),
          userName: report.userName || 'Un compañero'
        }, ...prev];
      });

      // Notificación sonora/voz más humana
      const sender = report.userName || 'Un compañero';
      speak(`Atención: ${sender} reportó un ${report.type} cerca de tu posición.`);
    });

    return () => {
      socket.off('new-report');
      socket.disconnect();
    };
  }, []);

  // Buscador con previsualización de mapeos
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.length > 2) {
        try {
          const res = await deliveryApi.searchSites(searchTerm);
          setSearchResults(res.data || []);
        } catch (e) { console.error(e); }
      } else { setSearchResults([]); }
    }, 400);
    return () => clearTimeout(searchTimer);
  }, [searchTerm]);

  const updateLocation = useCallback(async () => {
    try {
      const { location } = await Geolocation.checkPermissions();
      if (location !== 'granted') {
        await Geolocation.requestPermissions();
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      if (position && position.coords) {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        if (!userCoords) setUserCoords(coords);
      }
    } catch (e) {
      console.warn("GPS falló, usando Neiva Central:", e);
      setCurrentLocation({ lat: 2.9333, lng: -75.2872 });
    }
  }, [userCoords]);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  useEffect(() => {
    if (location.state?.targetSite) {
      const site = location.state.targetSite;
      setTargetSite(site);
      setUserCoords({ lat: site.latitude, lng: site.longitude });
      setPlaceName(site.customerName);
      setSheetHeight(45);
      speak(`Destino cargado: ${site.customerName}. ${site.notes || ''}`);
    }
  }, [location.state]);

  const handleAgilidadClick = async () => {
    try {
      speak("Detectando ubicación.");
      setLoading(true);

      // 1. Verificar y pedir permisos explícitamente (Evita cierres en Android)
      const perms = await Geolocation.requestPermissions();
      if (perms.location !== 'granted') {
        toast("Activa el GPS y permite el acceso para agilizar.", "warning");
        setLoading(false);
        return;
      }

      // 2. Obtener posición con timeout y fallback
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      if (position && position.coords) {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Llamada directa al geocoder
        await handleMapClick(latlng);
      } else {
        throw new Error("Sin señal GPS");
      }
    } catch (e) {
      console.error("Agilidad Crash Prevent:", e);
      toast("Error de GPS: Selecciona el punto manualmente.", "error");
      speak("No pude detectar tu GPS. Toca el mapa para marcar el sitio.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (latlng) => {
    if (!latlng || isNavigating) return;
    try {
      setUserCoords(latlng);
      setSheetHeight(45);
      setPlaceName("Identificando...");
      speak("Analizando punto de entrega.");

      // 1. Buscar el sitio mapeado más cercano para dar contexto
      const nearbyRes = await deliveryApi.getNearbySites(latlng.lat, latlng.lng, 100); // Radio pequeño de 100m
      const closest = nearbyRes.data && nearbyRes.data.length > 0 ? nearbyRes.data[0] : null;

      // 2. Geocodificación normal
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`, {
        headers: { 'Accept-Language': 'es' }
      });

      const data = await res.json();
      const name = data.display_name
        ? data.display_name.split(',').slice(0, 2).join(',')
        : `Sitio en Neiva (${latlng.lat.toFixed(4)})`;

      setPlaceName(name);

      if (closest && closest.distance_meters < 50) {
        setTargetSite(closest);
        speak(`Destino fijado en ${name}. Tienes un sitio mapeado muy cerca, a solo ${closest.distance_meters} metros, de ${closest.customerName}.`);
        toast(`Sitio cercano detectado: ${closest.customerName} (${closest.distance_meters}m)`, "info");
      } else {
        setTargetSite(null);
        speak(`Destino fijado en ${name}. Pulsa el botón azul para iniciar la ruta.`);
      }
    } catch (err) {
      console.error("Geocode Error:", err);
      setPlaceName("Ubicación en Neiva");
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setSheetHeight(25);
    radarTriggered.current = false;
    speak(`¡Todo listo! Iniciamos el viaje hacia ${placeName}. Te avisaré cuando estemos cerca de la fachada.`);

    // Iniciar seguimiento de GPS para el Radar
    watchId.current = Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 5000
    }, (position) => {
      if (position && position.coords) {
        const current = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(current);

        // Calcular distancia al objetivo
        if (userCoords) {
          const dist = getDistance(current, userCoords);
          if (dist < 30 && !radarTriggered.current) {
            triggerRadar();
          }
        }
      }
    });
  };

  const getDistance = (l1, l2) => {
    const R = 6371e3;
    const dLat = (l2.lat - l1.lat) * Math.PI / 180;
    const dLon = (l2.lng - l1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const triggerRadar = async () => {
    radarTriggered.current = true;

    if (targetSite?.photoUrl) {
      setRadarVisible(true);
      speak(`¡Mira! Estamos llegando. Aquí tienes la foto de la fachada de ${targetSite.customerName} para que no te pierdas.`);
    }
  };

  const arrivedAtSite = async () => {
    setIsNavigating(false);
    setRadarVisible(false);
    if (watchId.current) {
      Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    }

    // Registrar entrega completada automáticamente
    try {
      await deliveryApi.completeDelivery({
        deviceId,
        customerName: targetSite?.customerName || placeName,
        amount: 3500, // Tarifa base configurable
        address: targetSite?.address || placeName
      });
      toast("✅ Entrega registrada +$3,500", "success");
    } catch (e) {
      console.error("Error registrando entrega:", e);
    }

    setSheetHeight(85);
    speak("¡Excelente llegada! Ya registré tu entrega. Si puedes, regálanos una fotico de la fachada para ayudar a los demás compañeros.");
  };

  const takeSitePhoto = async () => {
    try {
      // Verificar permisos de cámara antes de abrir
      const perms = await Camera.requestPermissions();
      if (perms.camera !== 'granted') {
        return toast("Permiso de cámara denegado", "warning");
      }

      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        promptLabelHeader: '📸 CAPTURA EL PORTÓN / FACHADA',
      });
      setPhoto(image.base64String);
      setSheetHeight(90); // Expandir al máximo para editar notas
      speak("¡Qué buena foto! Ahora déjanos un detallito sobre la entrada para completar el mapeo.");
    } catch (e) {
      console.log("Cámara cancelada o error:", e);
    }
  };

  const finalizeMapeo = async () => {
    try {
      if (!photo) return toast("Toma la foto de la fachada para continuar", "warning");
      setLoading(true);

      const formData = new FormData();
      formData.append('customerName', placeName);
      formData.append('latitude', userCoords.lat);
      formData.append('longitude', userCoords.lng);
      formData.append('description', description);
      formData.append('notes', description); // Para consistencia con el modelo

      // Convertir base64 a Blob
      const byteCharacters = atob(photo);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      formData.append('photo', blob, 'fachada.jpg');

      const res = await deliveryApi.saveSite(formData);

      if (res.success) {
        toast("✅ Sitio mapeado con éxito. ¡Buen trabajo!", "success");
        speak("¡Perfecto! Fachada guardada con éxito. Mil gracias por ayudar a que la comunidad crezca.");
        setUserCoords(null);
        setPhoto(null);
        setDescription('');
        setSheetHeight(15);
        loadNearbyData(userCoords);
      } else {
        throw new Error(res.error || "Error al guardar");
      }
    } catch (e) {
      console.error(e);
      toast("Error al sincronizar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (type) => {
    if (!reportModal) return;

    const coords = { ...reportModal };
    const label = type === 'TRAFFIC' ? 'Trancón' : type === 'POLICE' ? 'Retén' : type === 'DANGER' ? 'Peligro' : 'Vía Cerrada';

    speak(`Enviando alerta de ${label}.`);
    toast(`Enviando reporte de ${label}...`, "info");

    try {
      setLoading(true);
      // Asegurar coordenadas limpias para el móvil e incluir nombre de usuario
      const payload = {
        latitude: parseFloat(coords.lat),
        longitude: parseFloat(coords.lng),
        type,
        description: `Alerta de ${label} reportada en vivo por domiciliario`,
        userName: user?.name || 'Un compañero'
      };

      console.log("📡 [ALERT_SYNC] Enviando:", payload);
      const res = await reportsApi.create(payload);

      if (res.success || res.id || res.data) {
        toast(`✅ ¡${label} Reportado!`, "success");
        speak(`¡Buen trabajo ${user?.name || ''}! Tu alerta ya está en el radar de todos.`);
        setReportModal(null);

        // Actualización inmediata del radar local (Optimistic UI)
        const newAlert = res.data || { ...payload, id: Date.now(), createdAt: new Date() };
        setNearbyReports(prev => [newAlert, ...prev]);
      }
    } catch (e) {
      console.error("❌ Error al reportar novedad:", e);
      toast(`Error al enviar: ${e.message}`, "error");
      // No cerramos el modal para que el usuario pueda reintentar
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="delivery-pro-app" onTouchMove={(e) => {
        if (!isDragging.current) return;
        const h = ((window.innerHeight - e.touches[0].clientY) / window.innerHeight) * 100;
        if (h > 12 && h < 95) setSheetHeight(h);
      }} onTouchEnd={() => isDragging.current = false}>

        {/* MODAL DE REPORTES DE COMUNIDAD */}
        {reportModal && (
          <div className="report-modal-overlay" onClick={(e) => {
            if (e.target.className === 'report-modal-overlay') setReportModal(null);
          }}>
            <div className="report-card">
              <h3>⚠️ REPORTAR NOVEDAD</h3>
              <p>Ayuda a otros domiciliarios informando qué pasa en esta zona.</p>
              <div className="report-options">
                <button onClick={() => submitReport('TRAFFIC')} disabled={loading} className="report-btn">
                  <span>🚗</span> Trancón
                </button>
                <button onClick={() => submitReport('POLICE')} disabled={loading} className="report-btn">
                  <span>🚓</span> Retén
                </button>
                <button onClick={() => submitReport('DANGER')} disabled={loading} className="report-btn">
                  <span>🔥</span> Peligro
                </button>
                <button onClick={() => submitReport('ROAD_BLOCK')} disabled={loading} className="report-btn">
                  <span>🚫</span> Vía Cerrada
                </button>
              </div>
              <button className="cancel" onClick={() => setReportModal(null)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* RADAR DE FOTOS AUTOMÁTICO */}
        {radarVisible && (
          <div className="photo-radar-overlay">
            <div className="radar-card">
              <div className="radar-header">
                <span className="live-tag">RADAR PROXIMIDAD</span>
                <button onClick={() => setRadarVisible(false)}>✕</button>
              </div>
              <img
                src={`${API_BASE_URL}${targetSite?.photoUrl}`}
                alt="Fachada"
              />
              <div className="radar-info">
                <strong>{targetSite?.customerName || placeName}</strong>
                <p>{targetSite?.notes || "Sin instrucciones adicionales"}</p>
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR CREATIVO (Dark Modern) */}
        <div className="search-layer">
          <div className="search-pill">
            <div className="pulse-dot"></div>
            <input
              type="text"
              placeholder="¿A quién entregamos hoy?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>}
          </div>

            {searchResults.length > 0 && (
            <div className="results-panel">
              <div className="results-header">
                <div className="label">RESULTADOS MAPEADOS</div>
                <button className="close-results" onClick={() => setSearchResults([])}>Cerrar</button>
              </div>
              {searchResults.map(site => (
                <div key={site.id} className="site-card" onClick={() => {
                  setTargetSite(site);
                  setPlaceName(site.customerName);
                  setUserCoords({lat: site.latitude, lng: site.longitude});
                  setSearchTerm('');
                  setSearchResults([]);
                  setSheetHeight(45);
                  speak(`Ruta a ${site.customerName}. Instrucción guardada: ${site.notes || 'Llegar a la puerta'}`);
                }}>
                  {site.photoUrl ? (
                    <img src={`${API_BASE_URL}${site.photoUrl}`} className="thumb" />
                  ) : (
                    <div className="thumb-none">📦</div>
                  )}
                  <div className="info">
                    <div className="name">{site.customerName}</div>
                    <div className="addr">{site.address}</div>
                    <div className="voice-tip">🔊 Ver instrucción exacta</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-layer">
          {/* BOTÓN DE ALERTA FLOTANTE (Siempre accesible) */}
          <button
            className="fab-alert"
            onClick={() => setReportModal(currentLocation || { lat: 2.9333, lng: -75.2872 })}
          >
            ⚠️
          </button>

          <MapContainer center={centerNeiva} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <CameraControl center={isNavigating ? currentLocation : userCoords} isNavigating={isNavigating} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents onClick={handleMapClick} onMoveEnd={loadNearbyData} />

            {/* Marcador del Repartidor (Driver) */}
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]} icon={motorIcon} zIndexOffset={1000} />
            )}

            {/* Renderizar sitios mapeados por la comunidad */}
            {nearbySites.map(site => (
              <Marker
                key={site.id}
                position={[site.latitude, site.longitude]}
                icon={communitySiteIcon}
                eventHandlers={{
                  click: () => {
                    setTargetSite(site);
                    setUserCoords({ lat: site.latitude, lng: site.longitude });
                    setPlaceName(site.customerName);
                    setSheetHeight(45);
                    speak(`Sitio mapeado: ${site.customerName}. Nota: ${site.notes || 'Sin notas'}`);
                  }
                }}
              />
            ))}

            {userCoords && <Marker position={[userCoords.lat, userCoords.lng]} icon={deliveryIcon} />}

            {/* Renderizar Reportes de la comunidad */}
            {nearbyReports.map((report) => {
              const lat = parseFloat(report.latitude);
              const lng = parseFloat(report.longitude);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={report.id}
                  position={[lat, lng]}
                  icon={getAlertIcon(report.type)}
                  zIndexOffset={2000}
                  eventHandlers={{
                    click: () => {
                      const msg = `${report.userName || 'Compañero'} reportó: ${report.type}`;
                      speak(msg);
                      toast(msg, "warning");
                    }
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* PANEL DE CONTROL INTERACTIVO */}
        <div className="interaction-sheet" style={{ height: `${sheetHeight}vh` }}>
          <div className="dragger" onTouchStart={() => isDragging.current = true}></div>

          <div className="sheet-content">
            {!userCoords ? (
              <div className="welcome-ui">
                <div className="badge">NEIVA • LIVE 🟢</div>
                <h2>Listo para repartir</h2>
                <p>Usa el buscador para ver fotos de fachadas y ahorrar tiempo en cada entrega.</p>
                <div className="quick-chips">
                  <span onClick={handleAgilidadClick} style={{ cursor: 'pointer', background: '#2563eb', color: 'white' }}>🚀 Agilidad</span>
                  <span onClick={() => setIsDarkMode(!isDarkMode)} style={{ cursor: 'pointer' }}>{isDarkMode ? '☀️ Día' : '🌙 Noche'}</span>
                </div>
              </div>
            ) : isNavigating ? (
              <div className="nav-ui">
                <div className="nav-header">
                  <span className="label">EN RUTA</span>
                  <h3>{placeName}</h3>
                </div>
                <button className="btn-arrived" onClick={arrivedAtSite}>¡LLEGUÉ A LA CASA! ✅</button>
              </div>
            ) : (
              <div className="mapper-ui">
                <div className="mapper-header">
                  <div>
                    <span className="tag">REGISTRO DE AGILIDAD</span>
                    <h2>{placeName}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="close"
                      onClick={() => {
                        const siteToFav = targetSite || location.state?.targetSite || nearbySites.find(s => s.customerName === placeName);
                        if (siteToFav?.id) addToFavs(siteToFav.id);
                        else toast("Solo puedes guardar sitios ya mapeados", "info");
                      }}
                      style={{ background: '#2563eb', color: 'white' }}
                    >
                      {(targetSite?.id && favIds.has(targetSite.id)) ? '⭐' : '☆'}
                    </button>
                    <button className="close" onClick={() => setUserCoords(null)}>✕</button>
                  </div>
                </div>

                <div className="mapper-body">
                  {/* Botón de Acción Principal para Domiciliarios */}
                  <button className="btn-start-route" onClick={startNavigation}>
                    🛰️ INICIAR RUTA HACIA EL PUNTO
                  </button>

                  <div className="divider-text">O REGISTRA DETALLES TÉCNICOS AHORA</div>

                  <div className="photo-box" onClick={takeSitePhoto}>
                    {photo ? (
                      <img src={`data:image/jpeg;base64,${photo}`} className="full" />
                    ) : (
                      <div className="ui">
                        <span className="icon">📸</span>
                        <p>TOMAR FOTO DE LA FACHADA</p>
                        <small>Hazlo por tus compañeros y por tu tiempo</small>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>INSTRUCCIÓN EXACTA (PARA LA VOZ)</label>
                    <textarea
                      placeholder="Ej: Portón café, timbre al lado del medidor, es la casa de rejas blancas..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <button className="btn-save-pro" onClick={finalizeMapeo} disabled={loading}>
                    {loading ? 'SINCRONIZANDO...' : '🚀 GUARDAR Y AGILIZAR MAPA'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .delivery-pro-app { position: absolute; inset: 0; background: #fff; overflow: hidden; font-family: 'Inter', sans-serif; }
          .map-layer { height: 100%; width: 100%; z-index: 1; }

          /* FAB Alert */
          .fab-alert {
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            z-index: 2500;
            width: 70px;
            height: 70px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 32px;
            box-shadow: 0 10px 30px rgba(239, 68, 68, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 4px solid white;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .fab-alert:active { transform: translateY(-50%) scale(0.9); background: #b91c1c; }

          /* Radar de Fotos */
          .photo-radar-overlay { position: absolute; top: 130px; right: 15px; z-index: 1001; width: 180px; animation: slideIn 0.5s ease; }
          .radar-card { background: #111; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.4); border: 1px solid #333; }
          .radar-header { display: flex; justify-content: space-between; align-items: center; padding: 10px; }
          .radar-header button { background: none; border: none; color: #fff; font-size: 16px; }
          .live-tag { font-size: 8px; font-weight: 900; color: #2563eb; background: rgba(37,99,235,0.2); padding: 3px 8px; border-radius: 5px; }
          .radar-card img { width: 100%; height: 120px; object-fit: cover; }
          .radar-info { padding: 12px; color: #fff; }
          .radar-info strong { display: block; font-size: 12px; margin-bottom: 4px; }
          .radar-info p { font-size: 10px; color: #94a3b8; margin: 0; line-height: 1.3; }

          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

          .custom-alert-marker {
            background: none !important;
            border: none !important;
          }

          .alert-marker-pulse {
            color: white;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: pulse-alert 2s infinite;
          }

          @keyframes pulse-alert {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }

          .search-pill { background: #111; height: 62px; border-radius: 31px; display: flex; align-items: center; padding: 0 20px; box-shadow: 0 12px 45px rgba(0,0,0,0.3); }
          .search-pill input { flex: 1; background: transparent; border: none; outline: none; padding: 0 15px; font-size: 16px; font-weight: 500; color: #fff; }
          .pulse-dot { width: 12px; height: 12px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 10px #2563eb; }
          .clear-btn { background: none; border: none; color: #666; font-size: 20px; }

          .results-panel { background: #fff; margin-top: 15px; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); max-height: 450px; overflow-y: auto; border: 1px solid #eee; }
          .results-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px 5px; }
          .results-panel .label { font-size: 10px; font-weight: 900; color: #2563eb; letter-spacing: 1.5px; }
          .close-results { background: #f1f5f9; border: none; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #64748b; }
          .site-card { display: flex; padding: 18px 22px; border-bottom: 1px solid #f5f5f5; gap: 18px; cursor: pointer; transition: 0.2s; }
          .site-card:active { background: #f8f9ff; }
          .thumb { width: 80px; height: 80px; border-radius: 15px; object-fit: cover; }
          .thumb-none { width: 80px; height: 80px; border-radius: 15px; background: #f0f4ff; display: flex; align-items: center; justify-content: center; font-size: 30px; }
          .site-card .name { font-weight: 800; font-size: 16px; color: #111; }
          .site-card .addr { font-size: 13px; color: #666; margin-top: 3px; }
          .voice-tip { font-size: 11px; color: #2563eb; font-weight: 700; margin-top: 8px; text-transform: uppercase; }

          /* Interaction Sheet */
          .interaction-sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; z-index: 1000; border-radius: 35px 35px 0 0; box-shadow: 0 -15px 50px rgba(0,0,0,0.12); transition: height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1); display: flex; flex-direction: column; }
          .dragger { width: 55px; height: 6px; background: #e2e8f0; border-radius: 10px; margin: 18px auto; cursor: ns-resize; }
          .sheet-content { padding: 0 25px 25px; flex: 1; overflow-y: auto; }

          /* Welcome UI */
          .badge { display: inline-block; background: #f1f5f9; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 15px; }
          .welcome-ui h2 { font-weight: 900; font-size: 24px; margin: 0 0 10px; color: #111; }
          .welcome-ui p { color: #64748b; font-size: 15px; margin-bottom: 25px; line-height: 1.5; }
          .quick-chips { display: flex; gap: 12px; }
          .quick-chips span { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; color: #475569; }

          /* Nav UI */
          .nav-ui { text-align: center; padding-top: 20px; }
          .nav-header .label { font-size: 10px; font-weight: 900; color: #2563eb; letter-spacing: 2px; }
          .nav-ui h3 { font-size: 26px; margin: 10px 0 25px; font-weight: 900; }
          .btn-arrived { width: 100%; background: #10b981; color: #fff; border: none; padding: 22px; border-radius: 24px; font-weight: 900; font-size: 16px; box-shadow: 0 12px 30px rgba(16, 185, 129, 0.3); }

          /* Mapper UI */
          .mapper-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
          .tag { background: #111; color: #fff; font-size: 9px; font-weight: 900; padding: 5px 12px; border-radius: 7px; }
          .mapper-header h2 { font-size: 22px; margin: 8px 0 0; font-weight: 900; }
          .close { background: #f1f5f9; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 20px; color: #64748b; }

          .photo-box { background: #f8fafc; border: 3px dashed #cbd5e1; border-radius: 35px; height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; margin-bottom: 25px; transition: 0.2s; }
          .photo-box:active { transform: scale(0.98); border-color: #2563eb; }
          .photo-box .ui { text-align: center; }
          .photo-box .icon { font-size: 55px; display: block; margin-bottom: 12px; }
          .photo-box p { font-weight: 900; font-size: 13px; margin: 0; color: #111; }
          .photo-box small { color: #94a3b8; font-size: 11px; }
          .full { width: 100%; height: 100%; object-fit: cover; }

          .btn-start-route { width: 100%; background: #2563eb; color: #fff; border: none; padding: 20px; border-radius: 22px; font-weight: 900; font-size: 15px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3); }
          .divider-text { text-align: center; font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 20px; letter-spacing: 1px; }

          .input-group label { display: block; font-size: 11px; font-weight: 900; color: #2563eb; margin-bottom: 12px; letter-spacing: 0.5px; }
          textarea { width: 100%; height: 110px; background: #f1f5f9; border: none; border-radius: 25px; padding: 20px; font-size: 15px; font-weight: 600; outline: none; margin-bottom: 30px; resize: none; color: #111; }
          .btn-save-pro { width: 100%; background: #2563eb; color: #fff; border: none; padding: 24px; border-radius: 26px; font-weight: 900; font-size: 16px; box-shadow: 0 15px 40px rgba(37, 99, 235, 0.25); }

          .error-screen { padding: 50px; color: white; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 900; }

          /* Report Modal */
          .report-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); }
          .report-card { background: #fff; width: 100%; max-width: 350px; border-radius: 30px; padding: 30px; text-align: center; }
          .report-card h3 { font-weight: 900; margin-bottom: 10px; color: #111; }
          .report-card p { color: #64748b; font-size: 14px; margin-bottom: 25px; }
          .report-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
          .report-options button { background: #f1f5f9; border: none; padding: 15px; border-radius: 15px; font-weight: 800; font-size: 13px; color: #1e293b; }
          .report-options button:active { background: #e2e8f0; transform: scale(0.95); }
          .report-card .cancel { background: none; border: none; color: #94a3b8; font-weight: 700; }
        `}</style>
      </div>
    </ErrorBoundary>
  )
}
