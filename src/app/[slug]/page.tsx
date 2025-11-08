import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { Metadata } from 'next';
import styles from './Home.module.css';

const dbPath = path.join(process.cwd(), 'db.json');

async function getData(slug: string) {
  const dbData = await fs.readFile(dbPath, 'utf-8');
  const db = JSON.parse(dbData);
  const site = db.sites.find((site: any) => site.slug === slug);
  return site;
}

export async function generateStaticParams() {
  const dbData = await fs.readFile(dbPath, 'utf-8');
  const db = JSON.parse(dbData);
  return db.sites.map((site: any) => ({
    slug: site.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const site = await getData(params.slug);
  return {
    title: site?.data.metadata.title,
    description: site?.data.metadata.description,
  };
}

const ActionButton = ({ text, link }: { text: string, link: string }) => (
  <Link href={link} className={styles.actionButton}>{text}</Link>
);

export default async function HomePage({ params }: { params: { slug: string } }) {
  const site = await getData(params.slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { hero, about, mainContact } = site.data;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {hero.videoUrl && (
          <video className={styles.heroVideo} autoPlay loop muted playsInline src={`/qr${hero.videoUrl}`} />
        )}
        <div className={styles.heroContent}>
          {hero.logoUrl && <img src={`/qr${hero.logoUrl}`} alt="Logo" className={styles.heroLogo} />}
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          {hero.button && hero.button.text && (
            <ActionButton text={hero.button.text} link={`/${params.slug}${hero.button.link}`} />
          )}
        </div>
      </section>

      {/* About Section */}
      {about && about.title && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{about.title}</h2>
          <p>{about.text}</p>
          {about.imageUrl && <img src={`/qr${about.imageUrl}`} alt="About" className={styles.aboutImage} />}
        </section>
      )}

      {/* Main Contact Section */}
      {mainContact && mainContact.title && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{mainContact.title}</h2>
          <p>{mainContact.text}</p>
          {mainContact.button && mainContact.button.text && (
            <ActionButton text={mainContact.button.text} link={`/${params.slug}${mainContact.button.link}`} />
          )}
        </section>
      )}
    </div>
  );
}