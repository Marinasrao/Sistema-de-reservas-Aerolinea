import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import AdminSidebar from './AdminSidebar';
import Footer from '../components/Footer';

const AdminLayout = ({ auth, onLogout }) => {


  const navigate = useNavigate();

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  if (isSmallScreen) {
    return (
      <div className={styles.mobileBlock}>
        <h2>⛔ Panel no disponible</h2>
        <p>El panel de administración solo puede utilizarse desde una computadora.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>

      <header className={styles.header}>
        <h2>FlightBooking</h2>

        <div className={styles.headerActions}>
          <button
            className={styles.homeBtn}
            onClick={() => navigate("/")}
          >
            Ir al Home
          </button>

          <button
            className={styles.logoutBtn}
            onClick={() => {
              onLogout();
              navigate("/");
            }}
          >
            Cerrar sesión
          </button>

        </div>
      </header>

      {auth?.isAdmin && (
        <aside className={styles.sidebarWrapper}>
          <AdminSidebar />
        </aside>
      )}

      <div className={styles.adminContent}>
        <main className={styles.adminMain}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.footer}>
        <Footer isAdmin={true} />
      </footer>

    </div>
  );
};

export default AdminLayout;
