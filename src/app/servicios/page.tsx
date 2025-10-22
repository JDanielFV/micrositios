import Header from '../../components/Header/Header';
import db from '../../../db.json';
import styles from './Servicios.module.css';

export default function ServiciosPage() {
  const { title, services } = db.servicesPage;

  return (
    <>
      <Header links={db.navigation} />
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
