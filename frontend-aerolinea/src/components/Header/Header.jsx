import { Link } from 'react-router-dom';
import { useState } from 'react';
import styles from './Header.module.css';
import { useLocation } from 'react-router-dom';

const Header = ({ auth }) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <header className={styles.header}>

            {/* Logo */}
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

            {/* Menú hamburguesa */}
            <button
                className={styles.mobileMenuButton}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                ☰
            </button>

            {/* Botones SOLO si NO está logueado */}
            <div className={`${styles.authButtons} ${menuOpen ? styles.showMenu : ''}`}>
            {isHome && (
                    <>
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
                    </>
                )}
            </div>

        </header>
    );
};

export default Header;
