import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 800); // Dar tiempo a la animación de salida
    }, 2500); // 2.5 segundos de visualización

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="logo-glow-wrapper">
          <div className="main-logo">
            <span className="logo-text">Neiva</span>
            <span className="logo-highlight">Pro</span>
          </div>
          <div className="glow-effect"></div>
        </div>
        <div className="tagline">Inteligencia Colectiva & Agilidad Urbana</div>
        <div className="loading-bar-container">
          <div className="loading-bar-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
