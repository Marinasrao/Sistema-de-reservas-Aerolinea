import React, { useEffect, useState } from 'react';
import styles from './PassengersListPage.module.css';
import { deletePassenger, getAllPassengers } from '../services/api';

const formatDate = (date) => {
  if (!date) return 'Sin fecha';

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = (price) => {
  if (!price) return 'No informado';

  return Number(price).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
};

const PassengersListPage = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPassengers = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllPassengers(page, 15);

      setPassengers(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error al cargar pasajeros:', err);
      setError('Error al cargar los pasajeros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      '¿Seguro que querés eliminar este pasajero? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      await deletePassenger(id);

      const updatedPassengers = passengers.filter((passenger) => passenger.id !== id);
      setPassengers(updatedPassengers);

      if (updatedPassengers.length === 0 && currentPage > 0) {
        fetchPassengers(currentPage - 1);
      }
    } catch (err) {
      console.error('Error al eliminar pasajero:', err);
      alert('Error al eliminar pasajero.');
    }
  };

  const toggleDetails = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <div className={styles.loader}>Cargando pasajeros...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Administración de reservas</span>
          <h2 className={styles.title}>Listado de pasajeros</h2>
          <p className={styles.subtitle}>
            Consultá los datos del pasajero, vuelo asignado, clase y asiento.
          </p>
        </div>

        <div className={styles.totalBadge}>
          {passengers.length} pasajero{passengers.length !== 1 ? 's' : ''} en esta página
        </div>
      </div>

      {passengers.length === 0 ? (
        <div className={styles.emptyState}>
          <span>✈</span>
          <h3>No hay pasajeros cargados todavía</h3>
          <p>Cuando se registre una reserva, aparecerá en este listado.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pasajero</th>
                  <th>Vuelo y ruta</th>
                  <th>Salida</th>
                  <th>Reserva</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {passengers.map((passenger) => (
                  <React.Fragment key={passenger.id}>
                    <tr className={styles.mainRow}>
                      <td>
                        <div className={styles.passengerCell}>
                          <div className={styles.avatar}>
                            {(passenger.firstName?.[0] || '')
                              + (passenger.lastName?.[0] || '')}
                          </div>

                          <div>
                            <strong>
                              {passenger.firstName} {passenger.lastName}
                            </strong>
                            <span>DNI {passenger.documentNumber || 'No informado'}</span>
                            <small>{passenger.email || 'Sin correo registrado'}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.flightCell}>
                          <strong>
                            <span className={styles.planeIcon}>✈</span>
                            {passenger.flightNumber || 'Vuelo no informado'}
                          </strong>

                          <span className={styles.route}>
                            {passenger.origin || 'Origen'} <b>→</b>{' '}
                            {passenger.destination || 'Destino'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.dateCell}>
                          <strong>{formatDate(passenger.departureDate)}</strong>
                          <span>
                            {passenger.departureTime
                              ? `${passenger.departureTime} hs`
                              : 'Horario no informado'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.reservationCell}>
                          <span
                            className={`${styles.badge} ${
                              styles[passenger.flightClass?.toLowerCase()] || ''
                            }`}
                          >
                            {passenger.flightClass || 'Sin clase'}
                          </span>

                          <span className={styles.seat}>
                            Asiento {passenger.seatNumber || '-'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            onClick={() => toggleDetails(passenger.id)}
                            className={styles.detailsBtn}
                          >
                            {expandedId === passenger.id ? 'Ocultar' : 'Ver detalle'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(passenger.id)}
                            className={styles.deleteBtn}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === passenger.id && (
                      <tr className={styles.detailsRow}>
                        <td colSpan="5">
                          <div className={styles.flightDetails}>
                            <div className={styles.detailItem}>
                              <span>Pasajero</span>
                              <strong>
                                {passenger.firstName} {passenger.lastName}
                              </strong>
                            </div>

                            <div className={styles.detailItem}>
                              <span>Documento</span>
                              <strong>{passenger.documentNumber || 'No informado'}</strong>
                            </div>

                            <div className={styles.detailItem}>
                              <span>Vuelo</span>
                              <strong>{passenger.flightNumber || 'No informado'}</strong>
                            </div>

                            <div className={styles.detailItem}>
                              <span>Itinerario</span>
                              <strong>
                                {passenger.origin || 'Origen'} →{' '}
                                {passenger.destination || 'Destino'}
                              </strong>
                            </div>

                            <div className={styles.detailItem}>
                              <span>Salida</span>
                              <strong>
                                {formatDate(passenger.departureDate)}
                                {passenger.departureTime
                                  ? ` · ${passenger.departureTime} hs`
                                  : ''}
                              </strong>
                            </div>

                            <div className={styles.detailItem}>
                              <span>Tarifa</span>
                              <strong>{formatPrice(passenger.price)}</strong>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                onClick={() => fetchPassengers(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← Anterior
              </button>

              <span>
                Página {currentPage + 1} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => fetchPassengers(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PassengersListPage;