import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./ReservationConfirmationPage.module.css";

const getStoredConfirmation = () => {
  try {
    return JSON.parse(localStorage.getItem("lastConfirmedReservation") || "null");
  } catch {
    return null;
  }
};

const classLabels = {
  economy: "Económica",
  business: "Ejecutiva",
  first: "Primera",
};

const normalizeFlightClass = (value) => {
  const normalized = String(value || "economy")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (
    normalized === "first" ||
    normalized === "primera" ||
    normalized === "first_class"
  ) {
    return "first";
  }

  if (
    normalized === "business" ||
    normalized === "ejecutiva" ||
    normalized === "executive"
  ) {
    return "business";
  }

  return "economy";
};

const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
};

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "A confirmar";
  }

  return `AR$ ${numericPrice.toLocaleString("es-AR")}`;
};

const getFlightName = (flight) => {
  if (!flight) return "Vuelo no registrado";

  const airline = flight.airline || "Aerolínea";
  const flightNumber = flight.flightNumber ? ` · ${flight.flightNumber}` : "";

  return `${airline}${flightNumber}`;
};

const getFlightSchedule = (flight) => {
  if (!flight) return "Horario no registrado";

  const departureTime = flight.departureTime || "--:--";
  const arrivalTime = flight.arrivalTime || "--:--";

  return `${departureTime} → ${arrivalTime}`;
};

const ReservationConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const reservation = location.state?.reservation || getStoredConfirmation();

  if (!reservation) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyCard}>
          <span className={styles.errorIcon}>!</span>

          <h2>No encontramos el comprobante de la reserva</h2>

          <p>
            Puede que hayas ingresado directamente a esta página o que la
            información de confirmación ya no esté disponible.
          </p>

          <div className={styles.actions}>
            <Link
              to="/profile"
              state={{ activeSection: "reservas" }}
              className={styles.primaryButton}
            >
              Ver mis reservas
            </Link>

            <Link to="/" className={styles.secondaryButton}>
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hasReturnFlight = Boolean(reservation.returnDate);
  const passengerDetails = Array.isArray(reservation.passengerDetails)
    ? reservation.passengerDetails
    : [];

  const flightClassLabel =
    classLabels[normalizeFlightClass(reservation.flightClass)] || "Económica";

  return (
    <main className={styles.page}>
      <section className={styles.confirmationCard}>
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>✓</div>

          <div>
            <span>Reserva realizada con éxito</span>
            <h2>Tu viaje quedó confirmado</h2>
            <p>
              Guardamos el comprobante de tu reserva. También podés consultarlo
              desde la sección Mis reservas de tu perfil.
            </p>
          </div>
        </div>

        <div className={styles.codeBox}>
          <div>
            <span>Código de reserva</span>
            <strong>{reservation.reservationCode || "FB-confirmada"}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{reservation.status || "Reserva confirmada"}</strong>
          </div>

          <div>
            <span>Pago</span>
            <strong>{reservation.paymentStatus || "Pago aprobado"}</strong>
          </div>
        </div>

        <section className={styles.routeCard}>
          <span>Detalle del viaje</span>

          <h3>
            {reservation.origin} → {reservation.destination}
          </h3>

          <p>
            {hasReturnFlight ? "Viaje de ida y vuelta" : "Viaje solo ida"} ·{" "}
            {flightClassLabel}
          </p>
        </section>

        <section className={styles.detailsGrid}>
          <div>
            <span>Fecha de ida</span>
            <strong>{formatDate(reservation.departureDate)}</strong>
          </div>

          <div>
            <span>Fecha de vuelta</span>
            <strong>
              {hasReturnFlight
                ? formatDate(reservation.returnDate)
                : "No requerida"}
            </strong>
          </div>

          <div>
            <span>Pasajeros</span>
            <strong>
              {reservation.passengers || 1}{" "}
              {Number(reservation.passengers || 1) === 1
                ? "pasajero"
                : "pasajeros"}
            </strong>
          </div>

          <div>
            <span>Clase</span>
            <strong>{flightClassLabel}</strong>
          </div>

          <div>
            <span>Total pagado</span>
            <strong>{formatPrice(reservation.totalPrice)}</strong>
          </div>

          <div>
            <span>Medio de pago</span>
            <strong>
              {reservation.paymentMethod === "debit"
                ? "Tarjeta de débito"
                : "Tarjeta de crédito"}
              {reservation.cardLastFour
                ? ` · terminada en ${reservation.cardLastFour}`
                : ""}
            </strong>
          </div>
        </section>

        <section className={styles.holderCard}>
          <span>Responsable de la reserva</span>

          <strong>
            {reservation.holderName || "Persona responsable no informada"}
          </strong>

          <p>{reservation.contactEmail || reservation.userEmail}</p>

          {reservation.contactPhone && <p>Teléfono: {reservation.contactPhone}</p>}

          {reservation.contactDocument && (
            <p>Documento: {reservation.contactDocument}</p>
          )}
        </section>

        <section className={styles.flightGrid}>
          <article className={styles.flightCard}>
            <span>Vuelo de ida · {formatDate(reservation.departureDate)}</span>

            <strong>{getFlightName(reservation.departureFlight)}</strong>

            <p>
              {reservation.origin} → {reservation.destination}
            </p>

            <small>{getFlightSchedule(reservation.departureFlight)}</small>
          </article>

          {hasReturnFlight && (
            <article className={styles.flightCard}>
              <span>Vuelo de vuelta · {formatDate(reservation.returnDate)}</span>

              <strong>{getFlightName(reservation.returnFlight)}</strong>

              <p>
                {reservation.destination} → {reservation.origin}
              </p>

              <small>{getFlightSchedule(reservation.returnFlight)}</small>
            </article>
          )}
        </section>

        {passengerDetails.length > 0 && (
          <section className={styles.passengersCard}>
            <div className={styles.sectionTitle}>
              <span>Pasajeros y asientos</span>
              <p>
                Se muestran también los datos opcionales completados durante la
                reserva.
              </p>
            </div>

            <div className={styles.passengerList}>
              {passengerDetails.map((passenger, index) => (
                <div
                  key={`${passenger.documentNumber || index}-${index}`}
                  className={styles.passengerItem}
                >
                  <strong>
                    Pasajero {index + 1}: {passenger.firstName}{" "}
                    {passenger.lastName}
                  </strong>

                  <p>Documento: {passenger.documentNumber}</p>

                  {passenger.email && <p>Email opcional: {passenger.email}</p>}

                  <small>
                    Asiento ida: {passenger.departureSeat || "Sin asiento"}
                    {hasReturnFlight &&
                      ` · Asiento vuelta: ${
                        passenger.returnSeat || "Sin asiento"
                      }`}
                  </small>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.notice}>
          Recibirás la información de la reserva en la cuenta asociada. Esta
          pantalla funciona como comprobante de confirmación del proceso.
        </div>

        <div className={styles.actions}>
          <Link
            to="/profile"
            state={{ activeSection: "reservas" }}
            className={styles.primaryButton}
          >
            Ver mis reservas
          </Link>

          <Link to="/" className={styles.secondaryButton}>
            Volver al inicio
          </Link>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </div>
      </section>
    </main>
  );
};

export default ReservationConfirmationPage;