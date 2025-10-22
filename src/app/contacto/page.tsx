import Header from '../../components/Header/Header';
import db from '../../../db.json';
import styles from './Contacto.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactoPage() {
  const { title, actions } = db.contactPage;

  return (
    <>
      <Header links={db.navigation} />
      <main className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <section className={styles.actionsGrid}>
          {actions.map((action, index) => (
            <Link key={index} href={action.link} className={styles.actionButton}>
              <Image
                src={action.iconUrl}
                alt={`${action.text} icon`}
                width={36}
                height={36}
                className={styles.actionIcon}
              />
              {action.text}
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
 
