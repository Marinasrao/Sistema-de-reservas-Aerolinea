import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './FlightsListPage.module.css';
import { getAllFlights, deleteFlight } from '../services/api';

const FlightsListPage = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('categoria');

    /* ==================== FETCH VUELOS ==================== */
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
                setError('Error al cargar los vuelos.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchFlights();

        return () => {
            isMounted = false;
        };
    }, [page]);

    /* ==================== ACCIONES ==================== */
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este vuelo?')) return;

        try {
            await deleteFlight(id);
            setFlights(prev => prev.filter(f => f.id !== id));
            setSuccess('Vuelo eliminado correctamente');
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError('Error al eliminar el vuelo.');
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-flight/${id}`);
    };

    const filteredFlights = categoryId
        ? flights.filter(f => f.categoryId === Number(categoryId))
        : flights;

    /* ==================== RENDER ==================== */
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Listado de Vuelos</h2>

            {categoryId && (
                <button
                    onClick={() => navigate('/vuelos')}
                    style={{ marginBottom: '1rem' }}
                >
                    Quitar filtros
                </button>
            )}

            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
                Mostrando {filteredFlights.length} vuelos
            </p>

            {/* LOADER */}
            {loading && (
                <div className={styles.loaderContainer}>
                    <p className={styles.loaderText}>Cargando vuelos...</p>
                </div>
            )}

            {/* TABLA */}
            {!loading && (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Aerolínea</th>
                                <th>Nro Vuelo</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Salida</th>
                                <th>Llegada</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>



                        <tbody>
                            {filteredFlights.map(flight => (

                                <tr key={flight.id}>
                                    <td>{flight.id}</td>

                                    <td>{flight.airline}</td>

                                    <td>{flight.flightNumber}</td>

                                    <td>{flight.origin}</td>

                                    <td>{flight.destination}</td>

                                    <td>
                                        {flight.departureDate}<br />
                                        <small>{flight.departureTime}</small>
                                    </td>

                                    <td>
                                        {flight.arrivalDate}<br />
                                        <small>{flight.arrivalTime}</small>
                                    </td>

                                    <td>{flight.categoryTitle || 'Sin categoría'}</td>

                                    <td>
                                        <button
                                            onClick={() => handleEdit(flight.id)}
                                            className={styles.editBtn}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(flight.id)}
                                            className={styles.deleteBtn}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>


                            ))}

                            {filteredFlights.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>
                                        No hay vuelos disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* PAGINACIÓN */}
                    <div className={styles.pagination}>
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            ◀ Anterior
                        </button>

                        <span style={{ margin: '0 1rem' }}>
                            Página {page + 1} de {totalPages}
                        </span>

                        <button
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(p => p + 1)}
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
