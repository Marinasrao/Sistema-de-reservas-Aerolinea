import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FlightsListPage.module.css';
import { getAllFlights, deleteFlight } from '../services/api';

const FlightsListPage = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

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
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Listado de Vuelos</h2>

            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Número Vuelo</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {flights.map(flight => (
                        <tr key={flight.id}>
                            <td>{flight.id}</td>
                            <td>{flight.flightNumber}</td>
                            <td>{flight.origin}</td>
                            <td>{flight.destination}</td>
                            <td>
                                <button onClick={() => handleEdit(flight.id)} className={styles.editBtn}>
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(flight.id)} className={styles.deleteBtn}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {flights.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>No hay vuelos disponibles.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FlightsListPage;
