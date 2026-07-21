import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./ReservationPage.module.css";
import { recoUrl } from "../config/mediaPaths";

const API = "http://localhost:8080/api";

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

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

const safeRecoUrl = (name) => {
  if (!name || typeof name !== "string") return "";

  if (/^https?:\/\//i.test(name)) {
    return name;
  }

  return recoUrl(name);
};

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

  const [destinationRecommendation, setDestinationRecommendation] =
    useState(null);
  const [loadingDestination, setLoadingDestination] = useState(false);

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
  };
  const selectedFlightClass = normalizeFlightClass(flightClass);
  const passengerCount = Number(passengers) || 1;
  const hasReturnFlight = Boolean(returnDate);
  const tripTypeLabel = hasReturnFlight ? "Ida y vuelta" : "Solo ida";

  const classMultipliers = {
    economy: 1,
    business: 1.6,
    first: 2.2,
  };

  const getFlightPrice = (flight) => {
    const basePrice = Number(flight?.price);

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return 0;
    }

    const multiplier = classMultipliers[selectedFlightClass] || 1;

    return Math.round(basePrice * multiplier);
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
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return "A confirmar";
    }

    return `AR$ ${numericPrice.toLocaleString("es-AR")}`;
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

  const destinationImage = useMemo(
    () =>
      safeRecoUrl(
        destinationRecommendation?.mainImage ||
          destinationRecommendation?.imageUrl ||
          destinationRecommendation?.image1 ||
          "",
      ),
    [destinationRecommendation],
  );

  const destinationTitle =
    destinationRecommendation?.title ||
    destinationRecommendation?.destination ||
    destination ||
    "Destino seleccionado";

  const destinationDescription =
    destinationRecommendation?.shortDescription ||
    destinationRecommendation?.description ||
    destinationRecommendation?.longDescription ||
    `Tu viaje desde ${origin || "origen"} hacia ${
      destination || "destino"
    } está listo para ser confirmado.`;

  useEffect(() => {
    if (!destination) {
      setDestinationRecommendation(null);
      return;
    }

    const controller = new AbortController();

    setLoadingDestination(true);

    fetch(`${API}/recommendations`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el detalle del destino.");
        }

        return response.json();
      })
      .then((data) => {
        const recommendations = Array.isArray(data) ? data : [];
        const normalizedDestination = normalizeText(destination);

        const match = recommendations.find((recommendation) => {
          const recDestination = normalizeText(recommendation.destination);
          const recTitle = normalizeText(recommendation.title);

          return (
            recDestination === normalizedDestination ||
            recTitle === normalizedDestination ||
            recDestination.includes(normalizedDestination) ||
            recTitle.includes(normalizedDestination)
          );
        });

        setDestinationRecommendation(match || null);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setDestinationRecommendation(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDestination(false);
        }
      });

    return () => controller.abort();
  }, [destination]);

  const savePendingReservation = () => {
    localStorage.setItem(
      "pendingReservation",
      JSON.stringify({
        ...reservation,
        flightClass: selectedFlightClass,
      }),
    );
  };

  const handleConfirmReservation = () => {
    if (!user || !reservationIsValid) return;

    savePendingReservation();

    navigate("/profile", {
      state: {
        openCheckout: true,
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
            Para guardar tu viaje, acceder a tus reservas y vivir una
            experiencia más completa en FlightBooking, necesitás iniciar sesión
            o crear una cuenta.
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
            Volvé a los resultados, elegí los vuelos disponibles para tu viaje y
            luego intentá nuevamente.
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
          <span className={styles.eyebrow}>Reserva de vuelo</span>
          <h2>Revisá tu viaje antes de continuar</h2>

          <p>
            Confirmá la ruta, fechas, clase y vuelos seleccionados. En el
            siguiente paso completarás pasajeros, asientos y pago.
          </p>
        </div>

        <section className={styles.destinationCard}>
          {destinationImage ? (
            <img
              className={styles.destinationImage}
              src={destinationImage}
              alt={destinationTitle}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.destinationPlaceholder}>✈️</div>
          )}

          <div className={styles.destinationContent}>
            <span className={styles.destinationLabel}>
              {loadingDestination ? "Cargando destino" : "Destino seleccionado"}
            </span>

            <h3>{destinationTitle}</h3>

            <p>{destinationDescription}</p>

            <div className={styles.destinationRoute}>
              <span>{origin}</span>
              <strong>→</strong>
              <span>{destination}</span>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <span>01</span>

            <div>
              <h3>Cuenta asociada</h3>

              <p>
                Esta cuenta permitirá guardar y consultar la reserva. Los datos
                de contacto, pasajeros y pago se completarán después.
              </p>
            </div>
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
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <span>02</span>

            <div>
              <h3>Resumen del viaje</h3>

              <p>
                Revisá la ruta, fechas, cantidad de pasajeros y clase elegida.
              </p>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span>Trayecto</span>
              <strong>
                {origin} → {destination}
              </strong>
            </div>

            <div className={styles.detailItem}>
              <span>Tipo de viaje</span>
              <strong>{tripTypeLabel}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Pasajeros</span>
              <strong>
                {passengerCount}{" "}
                {passengerCount === 1 ? "pasajero" : "pasajeros"}
              </strong>
            </div>

            <div className={styles.detailItem}>
              <span>Clase</span>
              <strong>{classLabels[selectedFlightClass]}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Fecha de ida</span>
              <strong>{formatDate(departureDate)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Fecha de vuelta</span>
              <strong>
                {hasReturnFlight ? formatDate(returnDate) : "No requerida"}
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <span>03</span>

            <div>
              <h3>Vuelos seleccionados</h3>

              <p>
                Confirmá aerolínea, número de vuelo, horarios y precio por
                pasajero.
              </p>
            </div>
          </div>

          <div className={styles.flightSummaryGrid}>
            <article className={styles.flightSummaryCard}>
              <div className={styles.flightTag}>Vuelo de ida</div>

              <h4>{getFlightDescription(selectedDepartureFlight)}</h4>

              <p>
                {origin} → {destination}
              </p>

              <strong>{formatDate(departureDate)}</strong>
              <span>{getFlightSchedule(selectedDepartureFlight)}</span>
              <small>{formatPrice(departurePrice)} por pasajero</small>
            </article>

            {hasReturnFlight && (
              <article className={styles.flightSummaryCard}>
                <div className={styles.flightTag}>Vuelo de vuelta</div>

                <h4>{getFlightDescription(selectedReturnFlight)}</h4>

                <p>
                  {destination} → {origin}
                </p>

                <strong>{formatDate(returnDate)}</strong>
                <span>{getFlightSchedule(selectedReturnFlight)}</span>
                <small>{formatPrice(returnPrice)} por pasajero</small>
              </article>
            )}
          </div>
        </section>

        <section className={styles.totalCard}>
          <div>
            <span>Total estimado</span>

            <p>
              {passengerCount} {passengerCount === 1 ? "pasajero" : "pasajeros"}{" "}
              · {tripTypeLabel} · {classLabels[selectedFlightClass]}
            </p>
          </div>

          <strong>{formatPrice(totalPrice)}</strong>
        </section>

        <div className={styles.notice}>
          Al continuar, completarás los datos de contacto, pasajeros, asientos y
          pago. La reserva quedará confirmada cuando finalice ese proceso.
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirmReservation}
          >
            Continuar con datos y pago
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
