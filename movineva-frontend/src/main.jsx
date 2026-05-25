import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// ELIMINAR FRANJA VERDE / FOCUS DE ANDROID Y BLOQUEOS
const style = document.createElement('style');
style.innerHTML = `
  * {
    outline: none !important;
    border: none !important;
    -webkit-tap-highlight-color: transparent !important;
    box-shadow: none !important;
    user-select: none !important;
    -webkit-user-drag: none !important;
  }
  :root {
    --brand: #2563eb;
    --brand-glow: rgba(37, 99, 235, 0.2);
  }
  input, textarea { user-select: text !important; }
  /* Aplicar color dinámico a elementos clave */
  .btn-primary, button[type="submit"], .active-link, .brand-text {
    background-color: var(--brand) !important;
  }
  .brand-border {
    border-color: var(--brand) !important;
  }
  .leaflet-container, .map-screen, .full-map-container {
    outline: none !important;
    border: none !important;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
