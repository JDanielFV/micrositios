'use client';

import { useState, useEffect } from 'react';
import styles from './Servicios.module.css';

interface ServicesContentProps {
  initialSite: any;
  slug: string;
}

export default function ServicesContent({ initialSite, slug }: ServicesContentProps) {
  const [site, setSite] = useState(initialSite);

  useEffect(() => {
    const handleLiveUpdate = (event: any) => {
      console.log('Services live preview update received:', event.detail);
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
  const { title, services } = data.servicesPage;

  return (
    <main className={styles.container}>
      <h1 className={`${styles.title} animate-slide-up`}>{title || 'Servicios'}</h1>
      <div className={styles.grid}>
        {(services || []).map((service: any, index: number) => (
          <div key={index} className={`${styles.serviceCard} animate-scale-in delay-${(index + 1) * 100}`}>
            <h2 className={styles.serviceTitle}>{service.title}</h2>
            <p className={styles.serviceDescription}>{service.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
