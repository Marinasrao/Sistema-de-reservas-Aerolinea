import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import AdminSidebar from './AdminSidebar';
import Footer from '../components/Footer';

const AdminLayout = () => {

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
        <h2> ⛔Panel no disponible</h2>
        <p>El panel de administración solo puede utilizarse desde una computadora.</p>
      </div>
    );
  }

 
  return (
    <div className={styles.adminContainer}>

      <header className={styles.header}>
        <h2>FlightBooking</h2>
      </header>

      <aside className={styles.sidebarWrapper}>
        <AdminSidebar />
      </aside>

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
