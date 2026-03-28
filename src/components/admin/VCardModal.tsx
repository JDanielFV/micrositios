'use client';

import { useEffect, useState } from 'react';
import styles from './VCardModal.module.css';

interface VCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  data: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    logoPreview: string | null;
  };
}

export default function VCardModal({ isOpen, onClose, onSave, data }: VCardModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Previsualización de vCard</h2>
          <p>Revisa los datos antes de asignar al botón.</p>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.logoContainer}>
            {data.logoPreview ? (
              <img src={data.logoPreview} alt="Logo" className={styles.logo} />
            ) : (
              <div style={{ color: '#ccc', fontSize: '0.7rem' }}>Sin Logo</div>
            )}
          </div>

          <div className={styles.info}>
            <strong className={styles.name}>{data.name}</strong>
            
            {data.phone && (
              <div className={styles.detailItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{data.phone}</span>
              </div>
            )}

            {data.whatsapp && (
              <div className={styles.detailItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.506-.173-.007-.371-.007-.57-.007-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.706 2.006-1.388.248-.682.248-1.265.174-1.388-.074-.124-.272-.198-.57-.347m-4.821 7.454c-1.893 0-3.748-.511-5.36-1.478l-.384-.227-3.982 1.044 1.063-3.885-.249-.396c-1.062-1.69-1.622-3.663-1.622-5.708 0-5.86 4.766-10.626 10.626-10.626 2.839 0 5.507 1.105 7.513 3.112 2.006 2.007 3.111 4.675 3.111 7.514 0 5.861-4.766 10.627-10.627 10.627m8.945-18.462C19.116 1.065 16.1 0 12.651 0 5.723 0 .083 5.64.083 12.567c0 2.212.578 4.371 1.676 6.304L0 24l5.122-1.343c1.867 1.02 3.976 1.558 6.123 1.558 6.928 0 12.569-5.64 12.569-12.568 0-3.356-1.306-6.511-3.678-8.883"/></svg>
                <span>{data.whatsapp}</span>
              </div>
            )}

            {data.email && (
              <div className={styles.detailItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{data.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>Descartar</button>
          <button onClick={onSave} className={styles.saveButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Guardar y Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
