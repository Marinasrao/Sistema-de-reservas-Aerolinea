import styles from './Footer.module.css';

const Footer = ({ isAdmin }) => {
  const footerClass = isAdmin
    ? `${styles.footer} ${styles.adminFooter}`
    : styles.footer;

  return (
    <footer className={footerClass}>
      <div className={styles.left}>
        <span>© 2025 FlightBooking</span>
      </div>

      <div className={styles.right}>
        <a href="#"><img src="/facebook.png" alt="Facebook" /></a>
        <a href="#"><img src="/instagram.png" alt="Instagram" /></a>
        <a href="#"><img src="/twitter.png" alt="Twitter" /></a>
        <a href="#"><img src="/correo.png" alt="Correo" /></a>
      </div>
    </footer>
  );
};

export default Footer;
