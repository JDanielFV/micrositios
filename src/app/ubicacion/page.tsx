import Header from '../../components/Header/Header';
import db from '../../../db.json';
import styles from './Ubicacion.module.css';

export default function UbicacionPage() {
  const { address, mapIframeUrl } = db.locationPage;

  return (
    <>
      <Header links={db.navigation} />
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
 
