import Header from '../../../components/Header/Header';
import db from '../../../../db.json';
import styles from './Ubicacion.module.css';
import { Metadata } from 'next';

async function getData(slug: string) {
  const site = db.sites.find((site) => site.slug === slug);
  return site;
}

export async function generateStaticParams() {
  return db.sites.map((site) => ({
    slug: site.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const site = await getData(params.slug);
  return {
    title: `Ubicación - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function UbicacionPage({ params }: { params: { slug: string } }) {
  const site = await getData(params.slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { data } = site;
  const { address, mapIframeUrl } = data.locationPage;

  const navLinks = data.navigation.map(link => ({
    ...link,
    link: `/${params.slug}${link.link}`
  }));

  return (
    <>
      <Header links={navLinks} />
      <main className={styles.container}>
        <section className={styles.content}>
          <h1 className={styles.title}>Nuestra Ubicación</h1>
          <p className={styles.address}>{address}</p>
          <div className={styles.mapContainer}>
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
