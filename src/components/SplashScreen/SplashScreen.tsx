'use client';

import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  enabled: boolean;
  videoUrl?: string;
}

export default function SplashScreen({ enabled, videoUrl }: SplashScreenProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false); // Default to false
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      // No mostrar splash screen si estamos dentro de un iframe (Vista previa)
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (isIframe) {
        setShowSplash(false);
        return;
      }

      const splashShown = sessionStorage.getItem('splashScreenShown') === 'true';

      if (enabled && !splashShown) {
        sessionStorage.setItem('splashScreenShown', 'true');
        setShowSplash(true);

        const fadeOutTimer = setTimeout(() => {
          setFadeOut(true);
        }, 4500);

        const hideSplashTimer = setTimeout(() => {
          setShowSplash(false);
        }, 5000);

        return () => {
          clearTimeout(fadeOutTimer);
          clearTimeout(hideSplashTimer);
        };
      } else {
        setShowSplash(false);
      }
    }
  }, [enabled, hasMounted]);

  if (!showSplash) {
    return null;
  }

  return (
    <div className={`${styles.splashContainer} ${fadeOut ? styles.fadeOut : ''}`}>
      {videoUrl && (
        <video
          className={styles.splashVideo}
          src={`/qrs${videoUrl}`}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      <div className={styles.splashContent}>
        {/* Loading text or other content can go here */}
      </div>
    </div>
  );
}
