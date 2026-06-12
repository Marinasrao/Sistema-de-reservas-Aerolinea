import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from './Header.module.css';

const Header = ({ auth, onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === "/";
    const user = auth?.user;
    const isLoggedIn = Boolean(user);
    const isAdmin = Boolean(auth?.isAdmin);

    const handleCloseMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = () => {
        setMenuOpen(false);
        onLogout();
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <Link to="/" className={styles.logoLink} onClick={handleCloseMenu}>
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

            <button
                className={styles.mobileMenuButton}
                onClick={() => setMenuOpen(!menuOpen)}
                type="button"
            >
                ☰
            </button>

            <div className={`${styles.authButtons} ${menuOpen ? styles.showMenu : ''}`}>
                {isHome && !isLoggedIn && (
                    <>
                        <Link
                            to="/register"
                            className={styles.authButton}
                            onClick={handleCloseMenu}
                        >
                            Crear cuenta
                        </Link>

                        <Link
                            to="/login"
                            className={styles.authButton}
                            onClick={handleCloseMenu}
                        >
                            Iniciar sesión
                        </Link>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <Link
                            to={isAdmin ? "/admin" : "/profile"}
                            className={styles.userGreeting}
                            onClick={handleCloseMenu}
                        >
                            Hola, {user.firstName}
                        </Link>

                        {isAdmin && (
                           <Link
                                to="/admin"
                                className={styles.authButton}
                                onClick={handleCloseMenu}
                            >
                                  Panel admin
                            </Link>
                        )}

                        <button
                            type="button"
                            className={styles.authButton}
                            onClick={handleLogout}
                        >
                            Cerrar sesión
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;