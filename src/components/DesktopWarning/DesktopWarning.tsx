import styles from './DesktopWarning.module.css';

const DesktopWarning = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        📱
        <h1>Experiencia Optimizada para Móviles</h1>
        <p>Para una mejor visualización, por favor abre este sitio en tu teléfono.</p>
      </div>
    </div>
  );
};

export default DesktopWarning;
