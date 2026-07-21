import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton/WhatsAppButton";
import styles from "./PublicLayout.module.css";

const PublicLayout = ({ auth, onLogout }) => {
  return (
    <div className={styles.publicContainer}>
      <Header auth={auth} onLogout={onLogout} />

      <main className={styles.publicMain}>
        <Outlet />
      </main>

      <WhatsAppButton />

      <Footer />
    </div>
  );
};

export default PublicLayout;