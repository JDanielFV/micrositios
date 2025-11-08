import Header from '../../../components/Header/Header';
import db from '../../../../db.json';
import styles from './Contacto.module.css';

import Link from 'next/link';
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
    title: `Contacto - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function ContactoPage({ params }: { params: { slug: string } }) {
  const site = await getData(params.slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { data } = site;
  const { title, actions } = data.contactPage;

  const navLinks = data.navigation.map(link => ({
    ...link,
    link: `/${params.slug}${link.link}`
  }));

  const updatedActions = actions.map(action => {
    // Prepend slug to internal page links, but not to external links or file paths
    if (action.link.startsWith('/') && !action.link.includes('.')) {
      return {
        ...action,
        link: `/${params.slug}${action.link}`
      };
    }
    return action;
  });

  return (
    <>
      <Header links={navLinks} />
      <main className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <section className={styles.actionsGrid}>
          {updatedActions.map((action, index) => {
            const isVCardButton = action.text === "Guardar contacto";

            if (isVCardButton) {
              return (
                <a
                  key={index}
                  href={`/qr${site.data.contactPage.vCardUrl}`}
                  className={styles.actionButton}
                  download
                >
                  <img
                    src={`/qr${action.iconUrl}`}
                    alt={`${action.text} icon`}
                    width={36}
                    height={36}
                    className={styles.actionIcon}
                  />
                  <span>{action.text}</span>
                </a>
              );
            }

            // For all other buttons
            return (
              <a
                key={index}
                href={action.link}
                className={styles.actionButton}
              >
                <img
                  src={`/qr${action.iconUrl}`}
                  alt={`${action.text} icon`}
                  width={36}
                  height={36}
                  className={styles.actionIcon}
                />
                <span>{action.text}</span>
              </a>
            );
          })}
        </section>
      </main>
    </>
  );
}
