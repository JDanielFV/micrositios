'use client';

import { useState, useEffect } from 'react';
import styles from './Contacto.module.css';

interface ContactContentProps {
  initialSite: any;
  slug: string;
}

export default function ContactContent({ initialSite, slug }: ContactContentProps) {
  const [site, setSite] = useState(initialSite);

  useEffect(() => {
    const handleLiveUpdate = (event: any) => {
      console.log('Contact live preview update received:', event.detail);
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
  const { title, actions } = data.contactPage;

  const updatedActions = actions.map((action: any) => {
    if (action.link.startsWith('/') && !action.link.includes('.')) {
      return {
        ...action,
        link: `/${slug}${action.link}`
      };
    }
    return action;
  });

  return (
    <main className={styles.container}>
      <h1 className={`${styles.title} animate-slide-up`}>{title || 'Contacto'}</h1>

      <div className={styles.actionsGrid}>
        {updatedActions.map((action: any, index: number) => {
          const isVCardButton = action.text === "Guardar contacto";

          if (isVCardButton) {
            return (
              <a
                key={index}
                href={`/qrs${encodeURI(site.data.contactPage.vCardUrl || '')}`}
                className={`${styles.actionButton} animate-scale-in delay-${(index + 1) * 100}`}
                download
              >
                <img
                  src={`/qrs${action.iconUrl}`}
                  alt={`${action.text} icon`}
                  width={36}
                  height={36}
                  className={styles.actionIcon}
                />
                <span>{action.text}</span>
              </a>
            );
          }

          return (
            <a
              key={index}
              href={action.link}
              className={`${styles.actionButton} animate-scale-in delay-${(index + 1) * 100}`}
            >
              <img
                src={`/qrs${action.iconUrl}`}
                alt={`${action.text} icon`}
                width={36}
                height={36}
                className={styles.actionIcon}
              />
              <span>{action.text}</span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
