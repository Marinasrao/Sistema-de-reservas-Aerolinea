import { useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import planeBg from "../assets/avion.png";

const API_BASE = "http://localhost:8080/api";

const getStoredToken = () => {
  try {
    const storedAuth = localStorage.getItem("auth");

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);

      return (
        parsedAuth?.token ||
        parsedAuth?.jwt ||
        parsedAuth?.accessToken ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken") ||
        ""
      );
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  } catch {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }
};

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const ProfilePage = ({ auth }) => {
  const location = useLocation();
  const user = auth?.user;

  const [activeSection, setActiveSection] = useState("profile");

  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    if (!user) return;

    const storageKey = `reservations_${user.email}`;
    const savedReservations = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const pendingReservation = JSON.parse(
      localStorage.getItem("pendingReservation") || "null"
    );

    if (pendingReservation) {
      const passengerCount = Number(pendingReservation.passengers) || 1;

      const departurePrice = Number(
        pendingReservation.selectedDepartureFlight?.price
      );

      const returnPrice = Number(
        pendingReservation.selectedReturnFlight?.price
      );

      const safeDeparturePrice = Number.isFinite(departurePrice)
        ? departurePrice
        : 0;

      const safeReturnPrice = Number.isFinite(returnPrice) ? returnPrice : 0;

      const newReservation = {
        id: Date.now(),
        reservationCode: `FB-${Date.now().toString().slice(-6)}`,
        userEmail: user.email,
        holderName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        contactEmail: user.email,

        origin: pendingReservation.origin || "No especificado",
        destination: pendingReservation.destination || "No especificado",

        departureDate: pendingReservation.departureDate || "",
        returnDate: pendingReservation.returnDate || "",

        passengers: passengerCount,
        flightClass: pendingReservation.flightClass || "economy",

        departureFlight: pendingReservation.selectedDepartureFlight || null,
        returnFlight: pendingReservation.selectedReturnFlight || null,

        departurePrice: safeDeparturePrice,
        returnPrice: safeReturnPrice,
        totalPrice: (safeDeparturePrice + safeReturnPrice) * passengerCount,

        status: "Reserva pendiente de confirmación",
        createdAt: new Date().toISOString(),
      };

      const updatedReservations = [newReservation, ...savedReservations];

      localStorage.setItem(storageKey, JSON.stringify(updatedReservations));
      localStorage.removeItem("pendingReservation");

      setReservations(updatedReservations);
      setActiveSection("reservas");
      setReservationMessage("Tu reserva fue guardada correctamente.");

      setTimeout(() => {
        setReservationMessage("");
      }, 3500);

      return;
    }

    setReservations(Array.isArray(savedReservations) ? savedReservations : []);

    if (location.state?.reservationCreated) {
      setActiveSection("reservas");
      setReservationMessage("Tu reserva fue guardada correctamente.");

      setTimeout(() => {
        setReservationMessage("");
      }, 3500);
    }
  }, [user, location.state]);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const token = getStoredToken();

      if (!token) {
        setFavorites([]);
        setLoadingFavorites(false);
        return;
      }

      try {
        setLoadingFavorites(true);
        setFavoritesError("");

        const res = await fetch(`${API_BASE}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No se pudieron cargar los favoritos");
        }

        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        setFavorites([]);
        setFavoritesError("No pudimos cargar tus favoritos en este momento.");
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/recommendations`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron cargar las recomendaciones");
        }

        return res.json();
      })
      .then((data) => {
        setRecommendations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setRecommendations([]);
      });

    return () => {
      controller.abort();
    };
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
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

  const handleRemoveFavorite = async (recommendationId) => {
    const token = getStoredToken();

    if (!token) return;

    try {
      setFavoritesError("");

      const res = await fetch(`${API_BASE}/favorites/${recommendationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el favorito");
      }

      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      setFavoritesError("No pudimos eliminar este favorito. Intentá nuevamente.");
    }
  };

  const handleRemoveReservation = (reservationId) => {
    const storageKey = `reservations_${user.email}`;

    const updatedReservations = reservations.filter(
      (reservation) => reservation.id !== reservationId
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedReservations));
    setReservations(updatedReservations);
  };

  const findRecommendationForReservation = (reservation) => {
    if (!reservation) return null;

    const reservationOrigin = normalizeText(reservation.origin);
    const reservationDestination = normalizeText(reservation.destination);

    return recommendations.find((rec) => {
      const recDestination = normalizeText(rec.destination);
      const recTitle = normalizeText(rec.title);
      const recOrigin = normalizeText(rec.origin);

      return (
        recDestination === reservationDestination ||
        recTitle === reservationDestination ||
        recOrigin === reservationOrigin ||
        recDestination === reservationOrigin ||
        recTitle === reservationOrigin ||
        recDestination.includes(reservationDestination) ||
        reservationDestination.includes(recDestination) ||
        recTitle.includes(reservationDestination) ||
        reservationDestination.includes(recTitle) ||
        recDestination.includes(reservationOrigin) ||
        reservationOrigin.includes(recDestination) ||
        recTitle.includes(reservationOrigin) ||
        reservationOrigin.includes(recTitle)
      );
    });
  };

  const openReviewModal = (reservation) => {
    setSelectedReservation(reservation);
    setSelectedRating(0);
    setReviewComment("");
    setReviewMessage("");
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReservation(null);
    setSelectedRating(0);
    setReviewComment("");
    setReviewMessage("");
    setSavingReview(false);
  };

  const handleSubmitReview = async () => {
    if (!selectedReservation) {
      setReviewMessage("No pudimos identificar la reserva seleccionada.");
      return;
    }

    if (!selectedRating) {
      setReviewMessage("Seleccioná una puntuación de 1 a 5 estrellas.");
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setReviewMessage("No pudimos validar tu sesión. Iniciá sesión nuevamente.");
      return;
    }

    const recommendation = findRecommendationForReservation(selectedReservation);

    if (!recommendation?.id) {
      setReviewMessage(
        "No encontramos el destino asociado a esta reserva para poder puntuarlo."
      );
      return;
    }

    try {
      setSavingReview(true);
      setReviewMessage("");

      const res = await fetch(
        `${API_BASE}/reviews/recommendation/${recommendation.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo guardar la valoración.");
      }

      setReviewMessage("Tu valoración fue publicada correctamente.");

      setTimeout(() => {
        closeReviewModal();
        setReservationMessage("Gracias por puntuar tu vuelo.");
        setActiveSection("reservas");

        setTimeout(() => {
          setReservationMessage("");
        }, 3500);
      }, 1200);
    } catch (error) {
      setReviewMessage(error.message || "No se pudo guardar la valoración.");
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className={styles.profileLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{initials}</div>

        <div className={styles.userInfo}>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
        </div>

        <nav className={styles.menu}>
          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "profile" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            Mi perfil
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "reservas" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("reservas")}
          >
            Mis reservas
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "favoritos" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("favoritos")}
          >
            Mis favoritos
          </button>
        </nav>
      </aside>

      <section className={styles.rightBlock}>
        <div
          className={styles.bgPlane}
          style={{ backgroundImage: `url(${planeBg})` }}
        />

        <div className={styles.overlay}>
          <div className={styles.profileContent}>
            {reservationMessage && (
              <div className={styles.favoriteMessage}>{reservationMessage}</div>
            )}

            {activeSection === "profile" && (
              <section className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>Panel personal</span>
                    <h3>Mi perfil</h3>
                  </div>
                </div>

                <div className={styles.profileSummaryGrid}>
                  <article className={styles.profileSummaryCard}>
                    <span>Reservas</span>
                    <strong>{reservations.length}</strong>
                    <p>Viajes guardados en tu perfil.</p>

                    <button
                      type="button"
                      onClick={() => setActiveSection("reservas")}
                    >
                      Ver reservas
                    </button>
                  </article>

                  <article className={styles.profileSummaryCard}>
                    <span>Favoritos</span>
                    <strong>{favorites.length}</strong>
                    <p>Destinos que guardaste para revisar después.</p>

                    <button
                      type="button"
                      onClick={() => setActiveSection("favoritos")}
                    >
                      Ver favoritos
                    </button>
                  </article>

                  <article className={styles.profileSummaryCard}>
                    <span>Valoraciones</span>
                    <strong>★</strong>
                    <p>Podés puntuar tus vuelos desde la sección Mis reservas.</p>

                    <button
                      type="button"
                      onClick={() => setActiveSection("reservas")}
                    >
                      Puntuar vuelo
                    </button>
                  </article>
                </div>
              </section>
            )}

            {activeSection === "reservas" && (
              <section id="reservas" className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Viajes seleccionados
                    </span>
                    <h3>Mis reservas</h3>
                  </div>

                  <div className={styles.favoritesActions}>
                    <span className={styles.favoritesCount}>
                      {reservations.length}{" "}
                      {reservations.length === 1 ? "reserva" : "reservas"}
                    </span>

                    <Link to="/" className={styles.continueButton}>
                      Buscar otro viaje
                    </Link>
                  </div>
                </div>

                {reservations.length === 0 ? (
                  <div className={styles.emptyFavorites}>
                    <h4>Todavía no tenés reservas</h4>
                    <p>
                      Elegí un destino, seleccioná fechas disponibles y confirmá
                      tu reserva para verla reflejada acá.
                    </p>

                    <Link to="/" className={styles.emptyAction}>
                      Buscar vuelos
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {reservations.map((reservation) => (
                      <article
                        key={reservation.id}
                        className={styles.reservationCard}
                      >
                        <div className={styles.reservationTopRow}>
                          <div>
                            <span className={styles.favoriteBadge}>
                              {reservation.status ||
                                "Reserva pendiente de confirmación"}
                            </span>

                            <h4>
                              {reservation.origin} → {reservation.destination}
                            </h4>
                          </div>

                          {reservation.reservationCode && (
                            <span className={styles.reservationCode}>
                              {reservation.reservationCode}
                            </span>
                          )}
                        </div>

                        <div className={styles.reservationHolder}>
                          <strong>
                            {reservation.holderName ||
                              `${user.firstName} ${user.lastName}`}
                          </strong>
                          <span>
                            {reservation.contactEmail || reservation.userEmail}
                          </span>
                        </div>

                        <div className={styles.reservationFlights}>
                          <div className={styles.reservationFlightItem}>
                            <span className={styles.reservationFlightLabel}>
                              Ida · {formatDate(reservation.departureDate)}
                            </span>

                            <strong>
                              {getFlightName(reservation.departureFlight)}
                            </strong>

                            <p>
                              {getFlightSchedule(reservation.departureFlight)}
                            </p>
                          </div>

                          {reservation.returnDate && (
                            <div className={styles.reservationFlightItem}>
                              <span className={styles.reservationFlightLabel}>
                                Vuelta · {formatDate(reservation.returnDate)}
                              </span>

                              <strong>
                                {getFlightName(reservation.returnFlight)}
                              </strong>

                              <p>
                                {getFlightSchedule(reservation.returnFlight)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className={styles.reservationFooter}>
                          <div>
                            <span>
                              {reservation.passengers || 1}{" "}
                              {Number(reservation.passengers || 1) === 1
                                ? "pasajero"
                                : "pasajeros"}
                            </span>

                            <span>
                              Clase:{" "}
                              {classLabels[reservation.flightClass] ||
                                "Económica"}
                            </span>
                          </div>

                          <strong>
                            Total: {formatPrice(reservation.totalPrice)}
                          </strong>
                        </div>

                        <div className={styles.reservationActions}>
                          <button
                            type="button"
                            className={styles.rateReservationButton}
                            onClick={() => openReviewModal(reservation)}
                          >
                            Puntuar vuelo
                          </button>

                          <button
                            type="button"
                            className={styles.removeFavoriteButton}
                            onClick={() =>
                              handleRemoveReservation(reservation.id)
                            }
                          >
                            Quitar reserva
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeSection === "favoritos" && (
              <section id="favoritos" className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Selecciones guardadas
                    </span>
                    <h3>Mis favoritos</h3>
                  </div>

                  <div className={styles.favoritesActions}>
                    <span className={styles.favoritesCount}>
                      {favorites.length}{" "}
                      {favorites.length === 1 ? "destino" : "destinos"}
                    </span>

                    <Link to="/" className={styles.continueButton}>
                      Seguir eligiendo
                    </Link>
                  </div>
                </div>

                {loadingFavorites ? (
                  <p className={styles.emptyText}>Cargando favoritos...</p>
                ) : favoritesError ? (
                  <p className={styles.errorText}>{favoritesError}</p>
                ) : favorites.length === 0 ? (
                  <div className={styles.emptyFavorites}>
                    <h4>Todavía no guardaste favoritos</h4>
                    <p>
                      Marcá el corazón en las recomendaciones del Home y tus
                      destinos aparecerán acá.
                    </p>

                    <Link to="/" className={styles.emptyAction}>
                      Ver recomendaciones
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {favorites.map((rec) => {
                      const imageName = rec.mainImage || rec.imageUrl || null;

                      const imageSrc = imageName
                        ? `http://localhost:8080/uploads/recommendations/${imageName}`
                        : "/placeholder.jpg";

                      return (
                        <div key={rec.id} className={styles.favoriteCard}>
                          <Link
                            to={`/recommendations/${rec.id}`}
                            className={styles.favoriteImageLink}
                          >
                            <img
                              src={imageSrc}
                              alt={rec.title}
                              className={styles.favoriteImage}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                          </Link>

                          <div className={styles.favoriteInfo}>
                            <div>
                              <Link
                                to={`/recommendations/${rec.id}`}
                                className={styles.favoriteTitleLink}
                              >
                                <h4>{rec.title}</h4>
                              </Link>
                            </div>

                            {rec.departureDate && (
                              <p>
                                Ida:{" "}
                                {new Date(rec.departureDate).toLocaleDateString(
                                  "es-AR"
                                )}
                              </p>
                            )}

                            <strong>
                              {rec.price != null
                                ? `AR$ ${Number(rec.price).toLocaleString(
                                    "es-AR"
                                  )}`
                                : "Precio no disponible"}
                            </strong>

                            <button
                              type="button"
                              className={styles.removeFavoriteButton}
                              onClick={() => handleRemoveFavorite(rec.id)}
                            >
                              Quitar de favoritos
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </section>

      {reviewModalOpen && selectedReservation && (
        <div className={styles.reviewModalOverlay}>
          <div className={styles.reviewModal}>
            <div className={styles.reviewModalHeader}>
              <div>
                <span>Valoración del viaje</span>
                <h3>¿Cómo fue tu experiencia?</h3>
              </div>

              <button
                type="button"
                className={styles.reviewCloseButton}
                onClick={closeReviewModal}
                aria-label="Cerrar valoración"
              >
                ✕
              </button>
            </div>

            <div className={styles.reviewTripSummary}>
              <strong>
                {selectedReservation.origin} → {selectedReservation.destination}
              </strong>
              <p>
                Ida: {formatDate(selectedReservation.departureDate)}
                {selectedReservation.returnDate &&
                  ` · Vuelta: ${formatDate(selectedReservation.returnDate)}`}
              </p>
            </div>

            <div className={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={
                    star <= selectedRating
                      ? styles.reviewStarActive
                      : styles.reviewStarButton
                  }
                  onClick={() => setSelectedRating(star)}
                  aria-label={`Puntuar con ${star} estrella${
                    star > 1 ? "s" : ""
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className={styles.reviewTextarea}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows="4"
              placeholder="Contanos cómo fue tu experiencia con este vuelo..."
            />

            {reviewMessage && (
              <p className={styles.reviewModalMessage}>{reviewMessage}</p>
            )}

            <div className={styles.reviewModalActions}>
              <button
                type="button"
                className={styles.reviewCancelButton}
                onClick={closeReviewModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.reviewSubmitButton}
                onClick={handleSubmitReview}
                disabled={savingReview}
              >
                {savingReview ? "Publicando..." : "Publicar valoración"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;