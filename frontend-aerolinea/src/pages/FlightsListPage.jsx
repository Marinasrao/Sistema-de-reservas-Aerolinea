import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./FlightsListPage.module.css";
import { getAllFlights, deleteFlight } from "../services/api";

const FlightsListPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoria");

  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllFlights(page, 5);

        if (!isMounted) return;

        setFlights(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        if (!isMounted) return;

        console.error("Error al cargar vuelos:", err);
        setError("Error al cargar los vuelos.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFlights();

    return () => {
      isMounted = false;
    };
  }, [page]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const handleDelete = async (id) => {
    if (deletingId !== null) return;

    if (!window.confirm("¿Eliminar este vuelo?")) return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccess(null);

      await deleteFlight(id);

      setFlights((prev) => prev.filter((flight) => flight.id !== id));
      setSuccess("Vuelo eliminado correctamente");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error al eliminar vuelo:", err);

      setError(
        err?.message ||
          "No se pudo eliminar el vuelo. Verificá si tiene pasajeros asociados.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-flight/${id}`);
  };

  const formatDate = (date) => {
    if (!date) return "Sin fecha";

    const [year, month, day] = String(date).split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return String(time).slice(0, 5);
  };

  const formatPrice = (price) => {
    const value = Number(price || 0);

    if (!value) return "Sin precio";

    return `AR$ ${value.toLocaleString("es-AR")}`;
  };

  const getStatusLabel = (status) => {
    if (!status) return "Programado";

    const normalized = String(status).toLowerCase();

    if (normalized.includes("cancel")) return "Cancelado";
    if (normalized.includes("demor")) return "Demorado";
    if (normalized.includes("final")) return "Finalizado";

    return "Programado";
  };

  const filteredFlights = categoryId
    ? flights.filter((flight) => flight.categoryId === Number(categoryId))
    : flights;

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div>
          <span className={styles.eyebrow}>Panel administrativo</span>
          <h2 className={styles.title}>Listado de vuelos</h2>
          <p className={styles.subtitle}>
            Consultá, editá o eliminá vuelos programados. Los asientos y
            pasajeros asociados se controlan desde el sistema.
          </p>
        </div>

        <button
          type="button"
          className={styles.newFlightBtn}
          onClick={() => navigate("/admin/add-flight")}
        >
          + Programar vuelo
        </button>
      </div>

      {categoryId && (
        <button
          type="button"
          onClick={() => navigate("/admin/listar-vuelos")}
          className={styles.clearFilterBtn}
        >
          Quitar filtro de categoría
        </button>
      )}

      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.summaryBar}>
        <strong>{filteredFlights.length}</strong>
        <span>
          {filteredFlights.length === 1
            ? "vuelo visible en esta página"
            : "vuelos visibles en esta página"}
        </span>
      </div>

      {loading ? (
        <div className={styles.loaderContainer}>
          <p className={styles.loaderText}>Cargando vuelos...</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Ruta</th>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Asientos</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredFlights.map((flight) => (
                  <tr key={flight.id}>
                    <td>
                      <div className={styles.flightCode}>
                        {flight.flightNumber || "Sin número"}
                      </div>
                      <small>{flight.airline || "Aerolínea"}</small>
                    </td>

                    <td>
                      <div className={styles.routeCell}>
                        <strong>{flight.origin || "Origen"}</strong>
                        <span>→</span>
                        <strong>{flight.destination || "Destino"}</strong>
                      </div>
                    </td>

                    <td>
                      <div className={styles.dateText}>
                        {formatDate(flight.departureDate)}
                      </div>
                      <small>{formatTime(flight.departureTime)}</small>
                    </td>

                    <td>
                      <div className={styles.dateText}>
                        {formatDate(flight.arrivalDate)}
                      </div>
                      <small>{formatTime(flight.arrivalTime)}</small>
                    </td>

                    <td>
                      <span className={styles.categoryPill}>
                        {flight.categoryTitle || "Sin categoría"}
                      </span>
                    </td>

                    <td>
                      <span className={styles.statusPill}>
                        {getStatusLabel(flight.flightStatus)}
                      </span>
                    </td>

                    <td>
                      <strong className={styles.priceText}>
                        {formatPrice(flight.price)}
                      </strong>
                    </td>

                    <td>
                      <span className={styles.seatsPill}>
                        {flight.seatsAvailable ?? 0}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleEdit(flight.id)}
                          className={styles.editBtn}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(flight.id)}
                          className={styles.deleteBtn}
                          disabled={deletingId === flight.id}
                        >
                          {deletingId === flight.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredFlights.length === 0 && (
                  <tr>
                    <td colSpan="9" className={styles.emptyCell}>
                      No hay vuelos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
            >
              ◀ Anterior
            </button>

            <span>
              Página {page + 1} de {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Siguiente ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlightsListPage;