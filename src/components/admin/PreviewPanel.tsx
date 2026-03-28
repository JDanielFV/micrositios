'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  siteData: any;
  slug: string;
  panelWidth?: 'compact' | 'normal' | 'wide';
  subRoute?: string; // New: handle navigation to /, /contacto, etc.
  currentSection?: string; // New: handle scrolling to specific IDs
}

export default function PreviewPanel({ 
  siteData, 
  slug, 
  panelWidth = 'normal',
  subRoute = '',
  currentSection = 'top'
}: PreviewPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build fixed preview URL (Home)
  const previewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/qrs/${slug}/`
    : `/qrs/${slug}/`;

  const cleanSubRoute = subRoute.startsWith('/') ? subRoute : `/${subRoute}`;
  const displayRouteName = cleanSubRoute === '/' ? 'Inicio' : cleanSubRoute.substring(1).toUpperCase();

  // Use subRoute change to trigger internal navigation message
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'NAVIGATE',
        route: subRoute || '/'
      }, window.location.origin);
    }
  }, [subRoute]);

  // Use currentSection change to trigger scroll message
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Small delay to ensure navigation happened if route changed too
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'SCROLL_TO',
          section: currentSection
        }, window.location.origin);
      }, 300);
    }
  }, [currentSection, subRoute]); // Re-scroll even if route changed

  // Reset loading state when slug changes (only on full site change)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [slug]);

  // Send updates to iframe when siteData changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_SITE_DATA',
        data: siteData
      }, window.location.origin);
    }
  }, [siteData]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    
    // Initial data push on load
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_SITE_DATA',
        data: siteData
      }, window.location.origin);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('No se pudo cargar la vista previa');
  };

  if (!mounted) return null;
  
  const widthClass = styles[panelWidth] || styles.normal;

  return (
    <div className={`${styles.container} ${styles.embedded} ${widthClass}`}>
      <div className={styles.iframeContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}>
              <svg width="32" height="32" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <p>Cargando...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.errorOverlay}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
            <button onClick={() => { setIsLoading(true); setError(null); }} className={styles.retryButton}>
              Reintentar
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={previewUrl}
          title={`Vista previa de ${slug}`}
          className={styles.iframe}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>

      <div className={styles.footer}>
        <p>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Vista previa en tiempo real. Guarda para ver cambios permanentes.
        </p>
      </div>
    </div>
  );
}
