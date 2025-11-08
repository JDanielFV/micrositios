import Header from '../../../components/Header/Header';
import db from '../../../../db.json';
import styles from './Servicios.module.css';
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
    title: `Servicios - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function ServiciosPage({ params }: { params: { slug: string } }) {
  const site = await getData(params.slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { data } = site;
  const { title, services } = data.servicesPage;

  const navLinks = data.navigation.map(link => ({
    ...link,
    link: `/${params.slug}${link.link}`
  }));

  return (
    <>
      <Header links={navLinks} />
      <main className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <h2 className={styles.serviceTitle}>{service.title}</h2>
              <p className={styles.serviceDescription}>{service.description}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
