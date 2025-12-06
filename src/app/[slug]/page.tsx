import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { Metadata } from 'next';
import styles from './Home.module.css';

import { getStaticParams } from '../../utils/getStaticParams';
import HeroSection from '../../components/HeroSection';

const dbPath = path.join(process.cwd(), 'db.json');

async function getData(slug: string) {
  const dbData = await fs.readFile(dbPath, 'utf-8');
  const db = JSON.parse(dbData);
  const site = db.sites.find((site: any) => site.slug === slug);
  return site;
}



export async function generateStaticParams() {
  return getStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await getData(slug);
  return {
    title: site?.data.metadata.title,
    description: site?.data.metadata.description,
  };
}

const ActionButton = ({ text, link }: { text: string, link: string }) => (
  <Link href={link} className={styles.actionButton}>{text}</Link>
);

export default async function HomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { hero, about, mainContact } = site.data;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <HeroSection hero={hero} slug={slug} />

      {/* About Section */}
      {
        about && about.title && (
          <section className={`${styles.section} animate-slide-up delay-200`}>
            <h2 className={styles.sectionTitle}>{about.title}</h2>
            <p>{about.text}</p>
            {about.imageUrl && <img src={`/qrs${about.imageUrl}`} alt="About" className={styles.aboutImage} />}
          </section>
        )
      }

      {/* Main Contact Section */}
      {
        mainContact && mainContact.title && (
          <section className={`${styles.section} animate-slide-up delay-300`}>
            <h2 className={styles.sectionTitle}>{mainContact.title}</h2>
            <p>{mainContact.text}</p>
            {mainContact.button && mainContact.button.text && (
              <ActionButton text={mainContact.button.text} link={`/${slug}${mainContact.button.link}`} />
            )}
          </section>
        )
      }
    </div >
  );
} 1