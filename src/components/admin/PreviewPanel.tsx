'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  siteData: any;
  slug: string;
  isVisible: boolean;
  isSidePanel?: boolean;
  panelWidth?: 'compact' | 'normal' | 'wide';
  onClose: () => void;
}

export default function PreviewPanel({ 
  siteData, 
  slug, 
  isVisible, 
  isSidePanel = false,
  panelWidth = 'normal',
  onClose 
}: PreviewPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build preview URL
  const previewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/qrs/${slug}/`
    : `/qrs/${slug}/`;

  // Reset loading state when slug changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [slug]);

  // Send updates to iframe when siteData changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && !isLoading) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_SITE_DATA',
        data: siteData
      }, window.location.origin);
    }
  }, [siteData, isLoading]);

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
  
  // Don't render if not visible and not side panel mode
  if (!isVisible && !isSidePanel) return null;

  const widthClass = styles[panelWidth] || styles.normal;

  return (
    <div 
      className={`${styles.container} ${isSidePanel ? styles.sidePanel : styles.modal} ${widthClass} ${isSidePanel ? styles.embedded : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h3>Vista Previa</h3>
        </div>
        <div className={styles.headerActions}>
          <a 
            href={`/qrs/${slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.openLink}
            title="Abrir en nueva pestaña"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <span className={styles.slugBadge}>/{slug}</span>
          {!isSidePanel && (
            <button onClick={onClose} className={styles.closeButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

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
