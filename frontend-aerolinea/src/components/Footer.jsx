import styles from './Footer.module.css';

const Footer = ({ isAdmin }) => {
  const footerClass = isAdmin
    ? `${styles.footer} ${styles.adminFooter}`
    : styles.footer;

  return (
    <footer className={footerClass}>
      <div className={styles.left}>
        <span>© 2026 FlightBooking</span>
      </div>

      <div className={styles.right}>
        <a href="#"><img src="/logo-fb.svg" alt="Facebook" /></a>
        <a href="#"><img src="/instagram.png" alt="Instagram" /></a>
        <a href="#"><img src="/twitter.png" alt="Twitter" /></a>
        <a href="#"><img src="/correo.png" alt="Correo" /></a>
      </div>
    </footer>
  );
};

export default Footer;
