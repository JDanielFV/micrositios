'use client';

import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css'; // We'll create this CSS module

interface SplashScreenProps {
  enabled: boolean;
  videoUrl?: string; // Optional video URL
  children: React.ReactNode;
}

export default function SplashScreen({ enabled, videoUrl, children }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(enabled);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (enabled) {
      // Start fade out after 4.5 seconds
      const fadeOutTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4500);

      // Hide splash screen completely after 5 seconds (0.5s after fade out starts)
      const hideSplashTimer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideSplashTimer);
      };
    } else {
      setShowSplash(false); // If not enabled, don't show at all
    }
  }, [enabled]);

  if (!showSplash) {
    return <>{children}</>; // Render children directly if splash is not shown
  }

  return (
    <div className={`${styles.splashContainer} ${fadeOut ? styles.fadeOut : ''}`}>
      {videoUrl && (
        <video
          className={styles.splashVideo}
          src={`/qr${videoUrl}`} // Prepend /qr for basePath
          autoPlay
          loop
          muted
          playsInline // Important for mobile autoplay
        />
      )}
      <div className={styles.splashContent}>
        {/* Add your logo, animation, etc. */}
      </div>
    </div>
  );
}