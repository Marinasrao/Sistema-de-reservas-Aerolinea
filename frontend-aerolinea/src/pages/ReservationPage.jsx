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
    selectedDepartureFlight,
    selectedReturnFlight,
  } = reservation;

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
  };

  const passengerCount = Number(passengers) || 1;
  const hasReturnFlight = Boolean(returnDate);

  const getFlightPrice = (flight) => {
    const price = Number(flight?.price);
    return Number.isFinite(price) ? price : 0;
  };

  const departurePrice = getFlightPrice(selectedDepartureFlight);
  const returnPrice = hasReturnFlight
    ? getFlightPrice(selectedReturnFlight)
    : 0;

  const totalPrice = (departurePrice + returnPrice) * passengerCount;

  const formatDate = (date) => {
    if (!date) return "Sin fecha";

    return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
  };

  const formatPrice = (price) => {
    if (!price) return "A confirmar";

    return `AR$ ${Number(price).toLocaleString("es-AR")}`;
  };

  const getFlightDescription = (flight) => {
    if (!flight) return "Vuelo no seleccionado";

    const airline = flight.airline || "Aerolínea";
    const number = flight.flightNumber ? ` · ${flight.flightNumber}` : "";

    return `${airline}${number}`;
  };

  const getFlightSchedule = (flight) => {
    if (!flight) return "Horario no seleccionado";

    const departure = flight.departureTime || "--:--";
    const arrival = flight.arrivalTime || "--:--";

    return `${departure} → ${arrival}`;
  };

  const reservationIsValid =
    Boolean(origin) &&
    Boolean(destination) &&
    Boolean(departureDate) &&
    Boolean(selectedDepartureFlight) &&
    (!hasReturnFlight || Boolean(selectedReturnFlight));

  const savePendingReservation = () => {
    localStorage.setItem("pendingReservation", JSON.stringify(reservation));
  };

  const handleConfirmReservation = () => {
    if (!user || !reservationIsValid) return;

    const reservationCode = `FB-${Date.now()
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    const newReservation = {
      id: Date.now(),
      reservationCode,
      userEmail: user.email,
      holderName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      contactEmail: user.email,

      origin: origin || "No especificado",
      destination: destination || "No especificado",

      departureDate: departureDate || "",
      returnDate: returnDate || "",

      passengers: passengerCount,
      flightClass: flightClass || "economy",

      departureFlight: selectedDepartureFlight,
      returnFlight: hasReturnFlight ? selectedReturnFlight : null,

      departurePrice,
      returnPrice,
      totalPrice,

      status: "Reserva pendiente de confirmación",
      createdAt: new Date().toISOString(),
    };

    const storageKey = `reservations_${user.email}`;
    const savedReservations = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

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
            más completa en FlightBooking, necesitás iniciar sesión o crear una
            cuenta.
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

  if (!reservationIsValid) {
    return (
      <div className={styles.page}>
        <section className={styles.summaryCard}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>Selección incompleta</span>
            <h2>No pudimos preparar la reserva</h2>

            <p>
              Para continuar necesitás elegir una fecha disponible y un horario
              real de vuelo.
            </p>
          </div>

          <div className={styles.notice}>
            Volvé a los resultados, elegí los vuelos disponibles para tu viaje
            y luego intentá nuevamente.
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate(-1)}
            >
              Volver a resultados
            </button>
          </div>
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
            Revisá tus vuelos seleccionados antes de guardar la reserva.
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
            <strong>{origin}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Destino</span>
            <strong>{destination}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Pasajeros</span>
            <strong>{passengerCount}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Clase</span>
            <strong>{classLabels[flightClass] || "Económica"}</strong>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span>Vuelo de ida</span>
            <strong>{getFlightDescription(selectedDepartureFlight)}</strong>
          </div>

          <div className={styles.detailItem}>
            <span>Fecha y horario de ida</span>
            <strong>
              {formatDate(departureDate)} ·{" "}
              {getFlightSchedule(selectedDepartureFlight)}
            </strong>
          </div>

          {hasReturnFlight && (
            <>
              <div className={styles.detailItem}>
                <span>Vuelo de vuelta</span>
                <strong>{getFlightDescription(selectedReturnFlight)}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Fecha y horario de vuelta</span>
                <strong>
                  {formatDate(returnDate)} ·{" "}
                  {getFlightSchedule(selectedReturnFlight)}
                </strong>
              </div>
            </>
          )}

          <div className={styles.detailItem}>
            <span>Valor por pasajero</span>
            <strong>
              {hasReturnFlight
                ? formatPrice(departurePrice + returnPrice)
                : formatPrice(departurePrice)}
            </strong>
          </div>

          <div className={styles.detailItem}>
            <span>Total estimado</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
        </div>

        <div className={styles.notice}>
          Estado inicial: <strong>Reserva pendiente de confirmación</strong>.
          <br />
          Tus vuelos seleccionados quedarán guardados en tu perfil.
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirmReservation}
          >
            Guardar reserva
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