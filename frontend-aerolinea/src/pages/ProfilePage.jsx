import { Navigate, Link, useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import planeBg from "../assets/avion.png";

const ProfilePage = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const user = auth?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }


  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/", { replace: true });
  };

  return (
    <div className={styles.profileLayout}>
      {/* Columna izquierda */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{initials}</div>

        <div className={styles.userInfo}>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
        </div>

        <nav className={styles.menu}>
          <Link
            to="/perfil"
            className={`${styles.menuItem} ${styles.menuItemActive}`}
          >
            Mi perfil
          </Link>

          <Link
            to="/reservas"
            className={`${styles.menuItem} ${styles.menuItemActive}`}
          >
            Mis reservas
          </Link>
        </nav>

        <button
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>



      </aside>

      {/* Columna derecha */}
      <section className={styles.rightBlock}>
        <div
          className={styles.bgPlane}
          style={{ backgroundImage: `url(${planeBg})` }}
        />

        <div className={styles.overlay}>
          <div className={styles.couponCard}>
            <span className={styles.label}>CUPÓN</span>
            <h3>35% OFF</h3>
            <p>En tu próximo vuelo</p>

            <Link to="/" className={styles.cta}>
              Buscar vuelos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;

