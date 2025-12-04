import { Link } from 'react-router-dom';
import { useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            {/* Bloque izquierdo: Logo + Lema */}
            <div className={styles.logoContainer}>
                <Link to="/" className={styles.logoLink}>
                    <img 
                        src="/logo-fb.svg" 
                        alt="FlightBooking" 
                        className={styles.logo}
                    />
                    <div className={styles.brandWrapper}>
                        <span className={styles.brandName}>FlightBooking</span>
                        <span className={styles.brandSlogan}>Vuela seguro con nosotros</span>
                    </div>
                </Link>
            </div>

            {/* Menú Hamburguesa (solo en móvil) */}
            <button 
                className={styles.mobileMenuButton}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú de navegación"
            >
                ☰
            </button>

            {/* Bloque derecho: Botones */}
            <div className={`${styles.authButtons} ${menuOpen ? styles.showMenu : ''}`}>
                <Link 
                    to="/register" 
                    className={styles.authButton}
                    onClick={() => setMenuOpen(false)}
                >
                    Crear cuenta
                </Link>
                <Link 
                    to="/login" 
                    className={styles.authButton}
                    onClick={() => setMenuOpen(false)}
                >
                    Iniciar sesión
                </Link>
            </div>
        </header>
    );
};

export default Header;