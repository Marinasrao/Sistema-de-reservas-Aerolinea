import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <NavLink to="/admin" className={styles.logoLink}>
                    <span className={styles.icon}>✈️</span>
                    <span className={styles.brandName}>AeroAdmin</span>
                </NavLink>
            </div>

            <nav className={styles.navMenu}>
                <NavItem to="/admin" icon="📊" text="Dashboard" end />
                <NavItem to="/admin/listar-vuelos" icon="📋" text="Listar Vuelos" />
                <NavItem to="/admin/passengers" icon="👥" text="Pasajeros" />
                <NavItem to="/admin/categories" icon="📂" text="Gestionar Categorías" />
                <NavItem to="/admin/recommendations" icon="💡" text="Gestionar Recomendaciones" />
                <NavItem to="/admin/hero" icon="🖼️" text="Portada Principal" />
                

            </nav>

        </aside>
    );
};

const NavItem = ({ to, icon, text, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
        }
    >
        <span className={styles.icon}>{icon}</span>
        {text}
    </NavLink>
);

export default AdminSidebar;