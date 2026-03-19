'use client';

import { useEffect, useState } from 'react';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function StatusBar({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  error = null,
  success = null
}: StatusBarProps) {
  const [showSuccess, setShowSuccess] = useState(!!success);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className={styles.container}>
      {/* Status indicator */}
      <div className={styles.status}>
        {isSaving ? (
          <div className={styles.saving}>
            <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
            <span>Guardando...</span>
          </div>
        ) : hasUnsavedChanges ? (
          <div className={styles.unsaved}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Cambios sin guardar</span>
          </div>
        ) : lastSaved ? (
          <div className={styles.saved}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Guardado: {lastSaved.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <div className={styles.ready}>
            <span>Listo</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {showSuccess && success && (
        <div className={`${styles.message} ${styles.success}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
