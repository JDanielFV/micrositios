import Header from '../../../components/Header/Header';
import db from '../../../../db.json';
import styles from './Contacto.module.css';

import Link from 'next/link';
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
    title: `Contacto - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function ContactoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  const { data } = site;
  const { title, actions } = data.contactPage;

  const navLinks = data.navigation.map(link => ({
    ...link,
    link: `/${slug}${link.link}`
  }));

  const updatedActions = actions.map(action => {
    // Prepend slug to internal page links, but not to external links or file paths
    if (action.link.startsWith('/') && !action.link.includes('.')) {
      return {
        ...action,
        link: `/${slug}${action.link}`
      };
    }
    return action;
  });

  const vCardAction = updatedActions.find(action => action.text === "Guardar contacto");
  const otherActions = updatedActions.filter(action => action.text !== "Guardar contacto");

  return (
    <>
      <Header links={navLinks} />
      <main className={styles.container}>
        <h1 className={`${styles.title} animate-slide-up`}>{title}</h1>

        <div className={styles.actionsGrid}>
          {updatedActions.map((action, index) => {
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

            // For all other buttons
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
    </>
  );
}
