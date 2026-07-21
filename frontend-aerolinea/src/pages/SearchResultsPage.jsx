import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./SearchResultsPage.module.css";
import FlightCalendar from "./FlightCalendar";
import { recoUrl } from "../config/mediaPaths";

const API = "http://localhost:8080/api";

const safeRecoUrl = (name) => {
  if (!name || typeof name !== "string") return "";
  if (/^https?:\/\//i.test(name)) return name;
  return recoUrl(name);
};

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const origin = params.get("origin");
  const destination = params.get("destination");
  const passengers = params.get("passengers") || "1";
  const flightClass = normalizeFlightClass(params.get("flightClass"));

  const rawFromDate =
    params.get("fromDate") ||
    params.get("date") ||
    params.get("departureDate") ||
    "";

  const rawToDate = params.get("toDate") || params.get("returnDate") || "";

  const fromDate = rawFromDate ? rawFromDate.substring(0, 10) : "";
  const toDate = rawToDate ? rawToDate.substring(0, 10) : "";

  const requiresReturnFlight = Boolean(toDate);

  const [selectedDepartureDate, setSelectedDepartureDate] = useState(
    fromDate || "",
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState(toDate || "");

  const [departureAvailability, setDepartureAvailability] = useState([]);
  const [returnAvailability, setReturnAvailability] = useState([]);

  const [departureSlots, setDepartureSlots] = useState([]);
  const [returnSlots, setReturnSlots] = useState([]);

  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const [destinationRecommendation, setDestinationRecommendation] =
    useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(true);

  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareNotice, setShareNotice] = useState("");

  const [availabilityError, setAvailabilityError] = useState("");
  const [retryAvailability, setRetryAvailability] = useState(0);
  const [reservationError, setReservationError] = useState("");

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
  };

  const normalizeAvailability = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item) => item && item.date)
      .map((item) => {
        const normalizedDate = String(item.date).substring(0, 10);

        const normalizedAvailable =
          item.available === true ||
          item.available === "true" ||
          item.hasFlights === true ||
          item.hasFlights === "true";

        return {
          date: normalizedDate,
          available: normalizedAvailable,
        };
      });
  };

  const isDateAvailable = (date, list) => {
    if (!date || !Array.isArray(list)) {
      return false;
    }

    const normalizedDate = String(date).substring(0, 10);

    return list.some((item) => {
      const itemDate = item?.date ? String(item.date).substring(0, 10) : "";

      return itemDate === normalizedDate && item.available === true;
    });
  };

  const departureDateAvailable = useMemo(
    () => isDateAvailable(selectedDepartureDate, departureAvailability),
    [selectedDepartureDate, departureAvailability],
  );

  const returnDateAvailable = useMemo(
    () => isDateAvailable(selectedReturnDate, returnAvailability),
    [selectedReturnDate, returnAvailability],
  );

  const canReserve =
    departureDateAvailable &&
    selectedDepartureFlight &&
    (!requiresReturnFlight ||
      (returnDateAvailable && selectedReturnDate && selectedReturnFlight));

  const destinationImage = safeRecoUrl(
    destinationRecommendation?.mainImage ||
      destinationRecommendation?.imageUrl ||
      destinationRecommendation?.image1 ||
      "",
  );

  const destinationTitle =
    destinationRecommendation?.title ||
    destinationRecommendation?.destination ||
    destination ||
    "Destino seleccionado";

  const destinationText =
    destinationRecommendation?.shortDescription ||
    destinationRecommendation?.description ||
    destinationRecommendation?.longDescription ||
    "Una propuesta seleccionada por FlightBooking para descubrir nuevos lugares y planificar tu próximo viaje.";

  const productUrl = window.location.href;
  const shareText = `${shareMessage}\n${productUrl}`;

  const handleModifySearch = () => {
    navigate(
      `/?origin=${encodeURIComponent(
        origin || "",
      )}&destination=${encodeURIComponent(destination || "")}`,
    );
  };

  const handleSelectDepartureDate = (date) => {
    setSelectedDepartureDate(date);
    setSelectedDepartureFlight(null);

    if (selectedReturnDate && selectedReturnDate < date) {
      setSelectedReturnDate("");
      setSelectedReturnFlight(null);
      setReservationError(
        "La fecha de vuelta anterior fue quitada. Elegí una vuelta posterior a la ida.",
      );
      return;
    }

    setReservationError("");
  };

  const handleSelectReturnDate = (date) => {
    if (selectedDepartureDate && date < selectedDepartureDate) {
      setReservationError(
        "La fecha de vuelta debe ser posterior a la fecha de ida.",
      );
      return;
    }

    setSelectedReturnDate(date);
    setSelectedReturnFlight(null);
    setReservationError("");
  };

  const handleSelectDepartureFlight = (slot) => {
    setSelectedDepartureFlight(slot);
    setReservationError("");
  };

  const handleSelectReturnFlight = (slot) => {
    setSelectedReturnFlight(slot);
    setReservationError("");
  };

  const handleReserve = () => {
    if (!departureDateAvailable) {
      setReservationError(
        "No hay vuelos disponibles para la fecha de ida seleccionada. Elegí una fecha marcada en verde.",
      );
      return;
    }

    if (!selectedDepartureFlight) {
      setReservationError(
        "Seleccioná un horario de ida disponible antes de continuar con la reserva.",
      );
      return;
    }

    if (requiresReturnFlight && !returnDateAvailable) {
      setReservationError(
        "No hay vuelos disponibles para la fecha de vuelta seleccionada. Elegí una fecha marcada en verde.",
      );
      return;
    }

    if (requiresReturnFlight && !selectedReturnFlight) {
      setReservationError(
        "Seleccioná un horario de vuelta disponible antes de continuar con la reserva.",
      );
      return;
    }

    setReservationError("");

    navigate("/reservation", {
      state: {
        origin,
        destination,
        departureDate: selectedDepartureDate,
        returnDate: selectedReturnDate,
        passengers,
        flightClass,
        selectedDepartureFlight,
        selectedReturnFlight: requiresReturnFlight
          ? selectedReturnFlight
          : null,
      },
    });
  };
  useEffect(() => {
    setSelectedDepartureDate(fromDate || "");
    setSelectedReturnDate(toDate || "");
    setDepartureSlots([]);
    setReturnSlots([]);
    setSelectedDepartureFlight(null);
    setSelectedReturnFlight(null);
    setReservationError("");
  }, [fromDate, toDate]);

  useEffect(() => {
    if (!origin || !destination || !fromDate) {
      setDepartureAvailability([]);
      setReturnAvailability([]);
      setDepartureSlots([]);
      setReturnSlots([]);
      setSelectedDepartureFlight(null);
      setSelectedReturnFlight(null);
      setAvailabilityError("");
      return;
    }

    const controller = new AbortController();

    const start = fromDate;
    const endDate = new Date(`${fromDate}T00:00:00`);
    endDate.setMonth(endDate.getMonth() + 3);

    const toDateRange = endDate.toISOString().split("T")[0];

    setAvailabilityError("");

    fetch(
      `${API}/availability?origin=${encodeURIComponent(
        origin,
      )}&destination=${encodeURIComponent(
        destination,
      )}&fromDate=${start}&toDate=${toDateRange}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo obtener la disponibilidad de ida");
        }

        return res.json();
      })
      .then((data) => {
        setDepartureAvailability(normalizeAvailability(data));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setDepartureAvailability([]);
          setDepartureSlots([]);
          setSelectedDepartureFlight(null);
          setAvailabilityError("Intentá nuevamente más tarde.");
        }
      });

    fetch(
      `${API}/availability?origin=${encodeURIComponent(
        destination,
      )}&destination=${encodeURIComponent(
        origin,
      )}&fromDate=${start}&toDate=${toDateRange}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo obtener la disponibilidad de vuelta");
        }

        return res.json();
      })
      .then((data) => {
        setReturnAvailability(normalizeAvailability(data));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setReturnAvailability([]);
          setReturnSlots([]);
          setSelectedReturnFlight(null);
          setAvailabilityError("Intentá nuevamente más tarde.");
        }
      });

    return () => {
      controller.abort();
    };
  }, [origin, destination, fromDate, retryAvailability]);

  useEffect(() => {
    setDepartureSlots([]);
    setSelectedDepartureFlight(null);

    if (!origin || !destination || !selectedDepartureDate) {
      return;
    }

    if (!departureDateAvailable) {
      return;
    }

    const controller = new AbortController();

    fetch(
      `${API}/availability/slots?origin=${encodeURIComponent(
        origin,
      )}&destination=${encodeURIComponent(
        destination,
      )}&date=${selectedDepartureDate}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener los horarios de ida");
        }

        return res.json();
      })
      .then((data) => {
        setDepartureSlots(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setDepartureSlots([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [origin, destination, selectedDepartureDate, departureDateAvailable]);

  useEffect(() => {
    setReturnSlots([]);
    setSelectedReturnFlight(null);

    if (!origin || !destination || !selectedReturnDate) {
      return;
    }

    if (!returnDateAvailable) {
      return;
    }

    const controller = new AbortController();

    fetch(
      `${API}/availability/slots?origin=${encodeURIComponent(
        destination,
      )}&destination=${encodeURIComponent(origin)}&date=${selectedReturnDate}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener los horarios de vuelta");
        }

        return res.json();
      })
      .then((data) => {
        setReturnSlots(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setReturnSlots([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [origin, destination, selectedReturnDate, returnDateAvailable]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/policies`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener las políticas");
        }

        return res.json();
      })
      .then((data) => {
        setPolicies(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setPolicies([]);
      })
      .finally(() => {
        setLoadingPolicies(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!destination) {
      setDestinationRecommendation(null);
      setLoadingRecommendation(false);
      setRecommendations([]);
      return;
    }

    const controller = new AbortController();

    setLoadingRecommendation(true);

    fetch(`${API}/recommendations`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener las recomendaciones");
        }

        return res.json();
      })
      .then((data) => {
        const recommendationsData = Array.isArray(data) ? data : [];

        setRecommendations(recommendationsData);

        const normalizedDestination = normalizeText(destination);

        const match = recommendationsData.find((rec) => {
          const recDestination = normalizeText(rec.destination);
          const recTitle = normalizeText(rec.title);

          return (
            recDestination === normalizedDestination ||
            recTitle === normalizedDestination ||
            recDestination.includes(normalizedDestination) ||
            recTitle.includes(normalizedDestination)
          );
        });

        setDestinationRecommendation(match || null);
      })
      .catch(() => {
        setDestinationRecommendation(null);
        setRecommendations([]);
      })
      .finally(() => {
        setLoadingRecommendation(false);
      });

    return () => {
      controller.abort();
    };
  }, [destination]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/categories`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener las categorías");
        }

        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCategories([]);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const text =
      destinationRecommendation?.destination ||
      destinationRecommendation?.title ||
      destination;

    if (!text) return;

    setShareMessage(`Mirá este destino recomendado en FlightBooking: ${text}.`);
  }, [destinationRecommendation, destination]);

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareNotice("Contenido copiado al portapapeles.");
    } catch {
      setShareNotice("No se pudo copiar el contenido.");
    }
  };

  const handleShare = async (network) => {
    const encodedUrl = encodeURIComponent(productUrl);
    const encodedText = encodeURIComponent(shareMessage);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    };

    if (network === "copy") {
      await copyShareText();
      return;
    }

    if (network === "instagram") {
      await copyShareText();
      window.open(
        "https://www.instagram.com/",
        "_blank",
        "noopener,noreferrer",
      );
      setShareNotice("Copiamos el contenido para que lo pegues en Instagram.");
      return;
    }

    window.open(urls[network], "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.container}>
      <section className={styles.searchResultsHeader}>
        <div>
          <span className={styles.searchEyebrow}>Búsqueda realizada</span>
          <h2>Resultados para tu viaje</h2>
          <p>
            Revisá las fechas disponibles, elegí horarios y avanzá con tu
            reserva.
          </p>

          <div className={styles.searchMetaPills}>
            <span>
              {origin} → {destination}
            </span>
            <span>
              {passengers} {Number(passengers) === 1 ? "pasajero" : "pasajeros"}
            </span>
            <span>{classLabels[flightClass] || "Económica"}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.modifySearchButton}
          onClick={handleModifySearch}
        >
          Modificar búsqueda
        </button>
      </section>

      <div className={styles.dualCalendar}>
        <FlightCalendar
          title="Ida"
          selectedDate={selectedDepartureDate}
          onSelectDate={handleSelectDepartureDate}
          availableDates={departureAvailability}
        />

        <FlightCalendar
          title="Vuelta"
          selectedDate={selectedReturnDate}
          onSelectDate={handleSelectReturnDate}
          availableDates={returnAvailability}
          minDate={selectedDepartureDate}
        />
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendAvailable}></span>
          Disponible
        </div>

        <div className={styles.legendItem}>
          <span className={styles.legendUnavailable}></span>
          No disponible
        </div>
      </div>

      {availabilityError && (
        <div className={styles.errorMessage}>
          <div>
            <strong>No pudimos cargar la disponibilidad</strong>
            <p>{availabilityError}</p>
          </div>

          <button
            type="button"
            onClick={() => setRetryAvailability((value) => value + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      <div className={styles.bookingSummary}>
        <div className={styles.summaryCard}>
          <div>
            <strong>IDA</strong>
            <p>
              {origin} → {destination}
            </p>
            <span>{selectedDepartureDate || "Sin fecha"}</span>
          </div>

          <span
            className={
              departureDateAvailable
                ? styles.statusAvailable
                : styles.statusUnavailable
            }
          >
            {departureDateAvailable ? "Disponible" : "No disponible"}
          </span>
        </div>

        <div className={styles.summaryCard}>
          <div>
            <strong>VUELTA</strong>
            <p>
              {destination} → {origin}
            </p>
            <span>
              {requiresReturnFlight
                ? selectedReturnDate || "Sin fecha"
                : "No requerida"}
            </span>
          </div>

          <span
            className={
              !requiresReturnFlight || returnDateAvailable
                ? styles.statusAvailable
                : styles.statusUnavailable
            }
          >
            {!requiresReturnFlight
              ? "Solo ida"
              : returnDateAvailable
                ? "Disponible"
                : "No disponible"}
          </span>
        </div>
      </div>

      <section className={styles.flightsSection}>
        <h3>Horarios de ida</h3>

        {!departureDateAvailable ? (
          <div className={styles.emptyState}>
            No hay vuelos disponibles para la fecha seleccionada. Elegí una
            fecha marcada en verde.
          </div>
        ) : departureSlots.length === 0 ? (
          <div className={styles.emptyState}>
            No encontramos vuelos disponibles para esta fecha.
          </div>
        ) : (
          <>
            <p className={styles.selectionHint}>
              Elegí el horario de ida que preferís.
            </p>

            <div className={styles.slotsGrid}>
              {departureSlots.map((slot, index) => {
                const isSelected = selectedDepartureFlight?.id === slot.id;

                return (
                  <button
                    key={slot.id ?? `${slot.flightNumber}-${index}`}
                    type="button"
                    className={`${styles.flightCard} ${
                      isSelected ? styles.flightCardSelected : ""
                    }`}
                    onClick={() => handleSelectDepartureFlight(slot)}
                    aria-pressed={isSelected}
                  >
                    <div>
                      <strong>{slot.departureTime}</strong>
                      <span>Salida</span>
                    </div>

                    <div className={styles.flightDetails}>
                      <p>{slot.airline}</p>
                      {slot.flightNumber && <small>{slot.flightNumber}</small>}
                      {slot.arrivalTime && (
                        <small>Llega {slot.arrivalTime}</small>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {requiresReturnFlight && (
        <section className={styles.flightsSection}>
          <h3>Horarios de vuelta</h3>

          {!returnDateAvailable ? (
            <div className={styles.emptyState}>
              No hay vuelos disponibles para la fecha seleccionada. Elegí una
              fecha marcada en verde.
            </div>
          ) : returnSlots.length === 0 ? (
            <div className={styles.emptyState}>
              No encontramos vuelos disponibles para esta fecha.
            </div>
          ) : (
            <>
              <p className={styles.selectionHint}>
                Elegí el horario de vuelta que preferís.
              </p>

              <div className={styles.slotsGrid}>
                {returnSlots.map((slot, index) => {
                  const isSelected = selectedReturnFlight?.id === slot.id;

                  return (
                    <button
                      key={slot.id ?? `${slot.flightNumber}-${index}`}
                      type="button"
                      className={`${styles.flightCard} ${
                        isSelected ? styles.flightCardSelected : ""
                      }`}
                      onClick={() => handleSelectReturnFlight(slot)}
                      aria-pressed={isSelected}
                    >
                      <div>
                        <strong>{slot.departureTime}</strong>
                        <span>Salida</span>
                      </div>

                      <div className={styles.flightDetails}>
                        <p>{slot.airline}</p>
                        {slot.flightNumber && (
                          <small>{slot.flightNumber}</small>
                        )}
                        {slot.arrivalTime && (
                          <small>Llega {slot.arrivalTime}</small>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      <section className={styles.destinationShowcase}>
        {destinationImage ? (
          <div className={styles.destinationImage}>
            <img src={destinationImage} alt={destinationTitle} />
          </div>
        ) : (
          <div className={styles.destinationImagePlaceholder}>
            <span>✈️</span>
          </div>
        )}

        <div className={styles.destinationInfo}>
          <span className={styles.destinationEyebrow}>
            {loadingRecommendation ? "Buscando destino" : "Destino recomendado"}
          </span>

          <h3>{destinationTitle}</h3>

          <p>{destinationText}</p>

          <div className={styles.destinationMeta}>
            {destinationRecommendation?.airport && (
              <span>✈️ {destinationRecommendation.airport}</span>
            )}

            {destinationRecommendation?.price != null && (
              <span>
                Desde AR${" "}
                {Number(destinationRecommendation.price).toLocaleString(
                  "es-AR",
                )}
              </span>
            )}

            {selectedDepartureDate && <span>Ida {selectedDepartureDate}</span>}

            {requiresReturnFlight && selectedReturnDate && (
              <span>Vuelta {selectedReturnDate}</span>
            )}
          </div>

          <button
            type="button"
            className={styles.destinationShareButton}
            onClick={() => {
              setShareOpen(true);
              setShareNotice("");
            }}
          >
            Compartir destino
          </button>
        </div>
      </section>

      <section className={styles.resultsPoliciesSection}>
        <div className={styles.resultsPoliciesHeader}>
          <span>Información importante</span>
          <h3>Políticas del viaje</h3>
        </div>

        {loadingPolicies ? (
          <p className={styles.resultsPolicyEmpty}>Cargando políticas...</p>
        ) : policies.length === 0 ? (
          <p className={styles.resultsPolicyEmpty}>
            No hay políticas disponibles para mostrar.
          </p>
        ) : (
          <div className={styles.resultsPoliciesGrid}>
            {policies.map((policy) => (
              <article key={policy.id} className={styles.resultsPolicyCard}>
                <div className={styles.resultsPolicyNumber}>
                  {String(policy.displayOrder || policy.id).padStart(2, "0")}
                </div>

                <div>
                  <h4>{policy.title}</h4>
                  <p>{policy.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className={styles.resultsReserveWrapper}>
        <div className={styles.reserveArea}>
          {reservationError && (
            <p className={styles.reservationValidationMessage}>
              {reservationError}
            </p>
          )}

          {!reservationError && !canReserve && (
            <p className={styles.reservationHelperMessage}>
              Seleccioná fechas disponibles y los horarios reales de tu vuelo
              para continuar.
            </p>
          )}

          <button
            type="button"
            className={`${styles.resultsReserveBtn} ${
              !canReserve ? styles.resultsReserveBtnPending : ""
            }`}
            onClick={handleReserve}
            disabled={!canReserve}
          >
            Reservar
          </button>
        </div>
      </div>

      <section className={styles.compactSuggestionsSection}>
        <div className={styles.compactSectionHeader}>
          <span>Más opciones para explorar</span>
          <h3>También puede interesarte</h3>
        </div>

        <div className={styles.compactCarousel}>
          {recommendations
            .filter(
              (rec) =>
                normalizeText(rec.destination || rec.title) !==
                normalizeText(destination),
            )
            .slice(0, 8)
            .map((rec) => {
              const imageSrc = safeRecoUrl(
                rec.mainImage || rec.imageUrl || rec.image1 || "",
              );

              return (
                <button
                  key={rec.id}
                  type="button"
                  className={styles.compactRecoCard}
                  onClick={() => navigate(`/recommendations/${rec.id}`)}
                >
                  {imageSrc ? (
                    <img src={imageSrc} alt={rec.title} />
                  ) : (
                    <div className={styles.compactPlaceholder}>✈️</div>
                  )}

                  <div>
                    <strong>{rec.title}</strong>
                    <span>
                      {rec.price != null
                        ? `Desde AR$ ${Number(rec.price).toLocaleString(
                            "es-AR",
                          )}`
                        : "Ver destino"}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      <section className={styles.compactSuggestionsSection}>
        <div className={styles.compactSectionHeader}>
          <span>Explorá por tipo de viaje</span>
          <h3>Categorías destacadas</h3>
        </div>

        <div className={styles.compactCarousel}>
          {categories.slice(0, 8).map((category) => {
            const imageSrc = category.image
              ? `http://localhost:8080/uploads/categories/${category.image}`
              : "";

            return (
              <button
                key={category.id}
                type="button"
                className={styles.compactCategoryCard}
                onClick={() =>
                  navigate(`/category-results?categories=${category.id}`)
                }
              >
                {imageSrc ? (
                  <img src={imageSrc} alt={category.title} />
                ) : (
                  <div className={styles.compactPlaceholder}>🌍</div>
                )}

                <strong>{category.title}</strong>
              </button>
            );
          })}
        </div>
      </section>

      {shareOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.shareModal}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.shareEyebrow}>Compartir producto</span>
                <h3>Compartir este destino</h3>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShareOpen(false)}
                aria-label="Cerrar ventana de compartir"
              >
                <span>✕</span>
              </button>
            </div>

            <div className={styles.sharePreview}>
              {destinationImage && (
                <img
                  src={destinationImage}
                  alt={destinationTitle}
                  className={styles.sharePreviewImage}
                />
              )}

              <div className={styles.sharePreviewInfo}>
                <h4>{destinationTitle}</h4>
                <p>
                  {origin} → {destination}
                </p>
                <span>{destinationText}</span>
              </div>
            </div>

            <div className={styles.shareField}>
              <label>Mensaje personalizado</label>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows="4"
              />
            </div>

            <div className={styles.shareLinkBox}>
              <span>{productUrl}</span>
            </div>

            {shareNotice && <p className={styles.shareNotice}>{shareNotice}</p>}

            <div className={styles.shareOptions}>
              <button type="button" onClick={() => handleShare("facebook")}>
                <span className={styles.shareIcon}>f</span>
                Facebook
              </button>

              <button type="button" onClick={() => handleShare("twitter")}>
                <span className={styles.shareIcon}>𝕏</span>
                Twitter/X
              </button>

              <button type="button" onClick={() => handleShare("instagram")}>
                <span className={styles.shareIcon}>◎</span>
                Instagram
              </button>

              <button type="button" onClick={() => handleShare("whatsapp")}>
                <span className={styles.shareIcon}>☘</span>
                WhatsApp
              </button>

              <button type="button" onClick={() => handleShare("copy")}>
                <span className={styles.shareIcon}>🔗</span>
                Copiar enlace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
