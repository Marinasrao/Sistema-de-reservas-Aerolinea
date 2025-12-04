import { Link } from 'react-router-dom';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administración Aerolínea</h1>

      <div className={styles.menuGrid}>
        
        <Link to="/admin/add-flight" className={`${styles.card} ${styles.flightCard}`}>
          <div className={styles.iconContainer}>
            <span className={styles['airplane-icon']}>
              <svg viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c3e50" />
                    <stop offset="100%" stopColor="#3498db" />
                  </linearGradient>
                </defs>
                <path d="M22 16.21v-1.895L14 8V4a2 2 0 0 0-4 0v4l-8 6.315v1.895l8-2.857V18l-2 2v2h2.5a.5.5 0 0 0 .5-.5v-1.5h2v1.5a.5.5 0 0 0 .5.5h2.5v-2l-2-2v-4.067l8 2.857z" />
              </svg>
            </span>
          </div>
          <div className={styles.textContainer}>
            <h3>Agregar Vuelo</h3>
            <p>Crear nuevo itinerario de vuelo</p>
          </div>
        </Link>

        <Link to="/admin/add-passenger" className={`${styles.card} ${styles.passengerCard}`}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>🧍‍♂️</span>
          </div>
          <div className={styles.textContainer}>
            <h3>Agregar Pasajero</h3>
            <p>Venta de Pasajes</p>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default AdminPanel;
