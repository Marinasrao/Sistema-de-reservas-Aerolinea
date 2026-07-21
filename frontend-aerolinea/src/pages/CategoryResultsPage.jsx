import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./CategoryResultsPage.module.css";

const API_BASE = "http://localhost:8080/api";

const CategoryResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryIds = useMemo(() => {
    return (
      searchParams.get("categories")?.split(",").map(Number).filter(Boolean) ||
      []
    );
  }, [searchParams]);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (categoryIds.length === 0) {
      setGroups([]);
      return;
    }

    let active = true;

    const fetchCategoryOffers = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          categories: categoryIds.join(","),
          limit: "6",
        });

        const res = await fetch(
          `${API_BASE}/flights/category-offers?${params.toString()}`,
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las ofertas.");
        }

        const data = await res.json();

        if (active) {
          setGroups(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);

        if (active) {
          setGroups([]);
          setError(
            "No pudimos cargar las ofertas por categoría. Intentá nuevamente.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCategoryOffers();

    return () => {
      active = false;
    };
  }, [categoryIds]);

  const formatDate = (date) => {
    if (!date) return "Fecha a confirmar";

    const [year, month, day] = String(date).split("-");
    return `${day}/${month}/${year}`;
  };

  const handleViewOptions = (flight) => {
    const params = new URLSearchParams({
      origin: flight.origin || "",
      destination: flight.destination || "",
      fromDate: flight.departureDate || "",
      tripType: "oneway",
      passengers: "1",
      flightClass: "economy",
    });

    navigate(`/search-results?${params.toString()}`);
  };

  const getFlightImageSrc = (flight) => {
    const imageName = Array.isArray(flight.imageUrls)
      ? flight.imageUrls[0]
      : "";

    if (!imageName) return "";

    if (/^https?:\/\//i.test(imageName)) {
      return imageName;
    }

    if (imageName.startsWith("/uploads")) {
      return `http://localhost:8080${imageName}`;
    }

    return `http://localhost:8080/uploads/recommendations/${imageName}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resultados por categoría</h2>
      {loading && <p>Cargando ofertas destacadas…</p>}

      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p className={styles.emptyText}>
          No hay vuelos programados actualmente para las categorías
          seleccionadas.
        </p>
      )}

      {!loading &&
        groups.map((group) => (
          <section key={group.categoryId} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <div>
                <h3 className={styles.categoryTitle}>{group.categoryTitle}</h3>

                {group.categoryPromoText && (
                  <p className={styles.categoryPromo}>
                    {group.categoryPromoText}
                  </p>
                )}
              </div>

              <span className={styles.categoryBadge}>Ofertas destacadas</span>
            </div>

            {group.flights?.length > 0 ? (
              <div className={styles.grid}>
                {group.flights.map((flight) => (
                  <article key={flight.id} className={styles.card}>
                    {getFlightImageSrc(flight) ? (
                      <img
                        src={getFlightImageSrc(flight)}
                        alt={`${flight.origin} a ${flight.destination}`}
                        className={styles.image}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <span>✈️</span>
                        <small>
                          {flight.origin} → {flight.destination}
                        </small>
                      </div>
                    )}
                    <div className={styles.body}>
                      <span className={styles.airline}>
                        {flight.airline || "Aerolínea"}
                      </span>

                      <h4 className={styles.route}>
                        {flight.origin} → {flight.destination}
                      </h4>

                      <p className={styles.flightNumber}>
                        {flight.flightNumber}
                      </p>

                      <p className={styles.schedule}>
                        {formatDate(flight.departureDate)} ·{" "}
                        {flight.departureTime || "--:--"} →{" "}
                        {flight.arrivalTime || "--:--"}
                      </p>

                      <p className={styles.price}>
                        Desde{" "}
                        <strong>
                          AR${" "}
                          {Number(flight.price || 0).toLocaleString("es-AR")}
                        </strong>
                      </p>

                      <button
                        type="button"
                        className={styles.optionsButton}
                        onClick={() => handleViewOptions(flight)}
                      >
                        Ver opciones
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>
                No hay ofertas vigentes para esta categoría.
              </p>
            )}
          </section>
        ))}
    </div>
  );
};

export default CategoryResultsPage;
