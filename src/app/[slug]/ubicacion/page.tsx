import Header from '../../../components/Header/Header';
import db from '../../../../db.json';
import styles from './Ubicacion.module.css';
import { Metadata } from 'next';

async function getData(slug: string) {
  const site = db.sites.find((site) => site.slug === slug);
  return site;
}

import { getStaticParams } from '../../../utils/getStaticParams';

export async function generateStaticParams() {
  return getStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await getData(slug);
  return {
    title: `Ubicación - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function UbicacionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { data } = site;
  const { address, mapIframeUrl } = data.locationPage;

  const navLinks = data.navigation.map(link => ({
    ...link,
    link: `/${slug}${link.link}`
  }));

  return (
    <>
      <Header links={navLinks} />
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
    </>
  );
}
