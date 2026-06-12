import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./ReservationPage.module.css";

const ReservationPage = ({ auth }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = auth?.user;
  const reservation = location.state || {};

  const {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    flightClass,
  } = reservation;

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
  };

  const savePendingReservation = () => {
    localStorage.setItem("pendingReservation", JSON.stringify(reservation));
  };

  const handleConfirmReservation = () => {
    if (!user) return;

    const newReservation = {
      id: Date.now(),
      userEmail: user.email,
      origin: origin || "No especificado",
      destination: destination || "No especificado",
      departureDate: departureDate || "",
      returnDate: returnDate || "",
      passengers: passengers || 1,
      flightClass: flightClass || "economy",
      status: "Pre-reserva",
      createdAt: new Date().toISOString(),
    };

    const storageKey = `reservations_${user.email}`;
    const savedReservations = JSON.parse(localStorage.getItem(storageKey) || "[]");

    localStorage.setItem(
      storageKey,
      JSON.stringify([newReservation, ...savedReservations])
    );

    navigate("/profile", {
      state: {
        reservationCreated: true,
      },
    });
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <section className={styles.loginCard}>
          <span className={styles.eyebrow}>Reserva personalizada</span>

          <h2>Iniciá sesión para continuar con tu reserva</h2>

          <p>
            Para guardar tu viaje, acceder a tus reservas y vivir una experiencia
            más completa en FlightBooking, necesitás iniciar sesión o crear una cuenta.
          </p>

          <div className={styles.actions}>
            <Link
              to="/login"
              className={styles.primaryButton}
              onClick={savePendingReservation}
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className={styles.secondaryButton}
              onClick={savePendingReservation}
            >
              Crear cuenta
            </Link>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.summaryCard}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Resumen de reserva</span>
          <h2>Tu viaje está casi listo</h2>
          <p>
            Revisá los datos seleccionados antes de continuar con la confirmación.
          </p>
        </div>

        <div className={styles.userBox}>
          <div className={styles.avatar}>
            {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`}
          </div>

          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span>{user.email}</span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span>Origen</span>
            <strong>{origin || "No especificado"}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Destino</span>
            <strong>{destination || "No especificado"}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Fecha de ida</span>
            <strong>{departureDate || "Sin fecha"}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Fecha de vuelta</span>
            <strong>{returnDate || "Sin fecha"}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Pasajeros</span>
            <strong>{passengers || 1}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Clase</span>
            <strong>{classLabels[flightClass] || "Económica"}</strong>
          </div>
        </div>

        <div className={styles.notice}>
          Esta sección prepara la reserva con los datos seleccionados. La confirmación
          final se completará en el flujo de reservas.
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirmReservation}
          >
            Confirmar reserva
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate(-1)}
          >
            Modificar búsqueda
          </button>
        </div>
      </section>
    </div>
  );
};

export default ReservationPage;