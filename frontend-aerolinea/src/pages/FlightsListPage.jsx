import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './FlightsListPage.module.css';
import { getAllFlights, deleteFlight } from '../services/api';



const FlightsListPage = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('categoria');


    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const data = await getAllFlights();
                setFlights(data);
            } catch (err) {
                setError('Error al cargar los vuelos.');
            } finally {
                setLoading(false);
            }
        };
        fetchFlights();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este vuelo?')) {
            setLoading(true);
            try {
                await deleteFlight(id);
                setFlights(flights.filter(f => f.id !== id));
                setSuccess('Vuelo eliminado correctamente');
                setTimeout(() => setSuccess(null), 3000);
            } catch {
                setError('Error al eliminar el vuelo.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-flight/${id}`);
    };

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <p className={styles.loaderText}>Cargando vuelos...</p>
            </div>
        );
    };
    const filteredFlights = categoryId
        ? flights.filter(f => f.categoryId === Number(categoryId))
        : flights;


    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Listado de Vuelos</h2>
            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
                Mostrando {filteredFlights.length} de {flights.length} vuelos
            </p>

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

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Número Vuelo</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredFlights.map(flight => (

                        <tr key={flight.id}>
                            <td>{flight.id}</td>
                            <td>{flight.flightNumber}</td>
                            <td>{flight.origin}</td>
                            <td>{flight.destination}</td>

                            <td>{flight.categoryTitle || "Sin categoría"}</td>

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
        </div>
    );
};

export default FlightsListPage;
