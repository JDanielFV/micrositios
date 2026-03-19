'use client';

import { useState, useEffect } from 'react';
import styles from './Ubicacion.module.css';

interface LocationContentProps {
  initialSite: any;
  slug: string;
}

export default function LocationContent({ initialSite, slug }: LocationContentProps) {
  const [site, setSite] = useState(initialSite);

  useEffect(() => {
    const handleLiveUpdate = (event: any) => {
      console.log('Location live preview update received:', event.detail);
      setSite((prev: any) => ({
        ...prev,
        data: event.detail
      }));
    };

    window.addEventListener('SITE_DATA_LIVE_UPDATE', handleLiveUpdate);
    return () => window.removeEventListener('SITE_DATA_LIVE_UPDATE', handleLiveUpdate);
  }, []);

  if (!site) return <div>Sitio no encontrado</div>;

  const { data } = site;
  const { address, mapIframeUrl } = data.locationPage;

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <h1 className={`${styles.title} animate-slide-up`}>Nuestra Ubicación</h1>
        <p className={styles.address}>{address}</p>
        <div className={`${styles.mapContainer} animate-fade-in delay-200`}>
          <iframe
            src={mapIframeUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </main>
  );
}
