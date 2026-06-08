'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Home.module.css';
import HeroSection from '../../components/HeroSection';

interface PageContentProps {
  initialSite: any;
  slug: string;
}

const ActionButton = ({ text, link }: { text: string, link: string }) => (
  <Link href={link} className={styles.actionButton}>{text}</Link>
);

const getSafeUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `/qrs${url}`;
};

export default function PageContent({ initialSite, slug }: PageContentProps) {
  const [site, setSite] = useState(initialSite);

  useEffect(() => {
    const handleLiveUpdate = (event: any) => {
      console.log('Live preview update received via CustomEvent:', event.detail);
      setSite((prev: any) => ({
        ...prev,
        data: event.detail
      }));
    };

    window.addEventListener('SITE_DATA_LIVE_UPDATE', handleLiveUpdate);
    return () => window.removeEventListener('SITE_DATA_LIVE_UPDATE', handleLiveUpdate);
  }, []);

  if (!site) return <div>Sitio no encontrado</div>;

  const { hero, about, mainContact } = site.data;

  return (
    <div className={`${styles.container} ${styles['site-' + slug]}`}>
      {/* Hero Section */}
      <div id="hero">
        <HeroSection hero={hero} slug={slug} />
      </div>

      {/* About Section */}
      {
        about && about.title && (
          <section id="about" className={`${styles.section} animate-slide-up delay-200`}>
            <h2 className={styles.sectionTitle}>{about.title}</h2>
            <p>{about.text}</p>
            {about.imageUrl && <img src={getSafeUrl(about.imageUrl)} alt="About" className={styles.aboutImage} />}
          </section>
        )
      }

      {/* Main Contact Section */}
      {
        mainContact && mainContact.title && (
          <section id="main-contact" className={`${styles.section} animate-slide-up delay-300`}>
            <h2 className={styles.sectionTitle}>{mainContact.title}</h2>
            <p>{mainContact.text}</p>
            {mainContact.button && mainContact.button.text && (
              <ActionButton text={mainContact.button.text} link={`/${slug}${mainContact.button.link}`} />
            )}
          </section>
        )
      }
    </div>
  );
}
