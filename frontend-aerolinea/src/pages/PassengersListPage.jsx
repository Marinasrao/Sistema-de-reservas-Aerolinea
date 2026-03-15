import React, { useEffect, useState } from 'react';
import styles from './PassengersListPage.module.css';
import { deletePassenger, getAllPassengers } from '../services/api';

const PassengersListPage = () => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    
    const fetchPassengers = async (currentPage = 0) => {
        try {
            const data = await getAllPassengers(currentPage, 15);


            setPassengers(Array.isArray(data.content) ? data.content : []);
            setTotalPages(data.totalPages || 0);

        } catch (err) {
            setError('Error al cargar los pasajeros.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassengers();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deletePassenger(id);
            setPassengers(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('Error al eliminar pasajero.');
        }
    };

    const toggleDetails = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    if (loading) return <div className={styles.loader}>Cargando pasajeros...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Listado de Pasajeros</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Pasajero</th>
                        <th>Documento</th>
                        <th>Email</th>
                        <th>Clase</th>
                        <th>Asiento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(passengers) && passengers.map(p => (
                                
                        <React.Fragment key={p.id}>
                            
                            <tr className={styles.mainRow}>
                                <td>{p.firstName} {p.lastName}</td>
                                <td>{p.documentNumber}</td>
                                <td>{p.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[p.flightClass?.toLowerCase()]}`}>
                                        {p.flightClass}
                                    </span>
                                </td>
                                <td className={styles.seat}>{p.seatNumber || "-"}</td>
                                <td>
                                    
                                    <button onClick={() => toggleDetails(p.id)} className={styles.detailsBtn}>
                                        {expandedId === p.id ? 'Ocultar' : '+ Detalles'}
                                    </button>

                                    <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>

                            {expandedId === p.id && (
                                <tr>
                                    <td colSpan="6">
                                        <div className={styles.flightDetails}>
                                            <div className={styles.flightNumber}>
                                                ✈ {p.flightNumber}
                                            </div>

                                            <div>
                                                📍 {p.origin} → {p.destination}
                                            </div>

                                            <div>
                                                📅 {p.departureDate} • 🕐 {p.departureTime}
                                            </div>

                                            <div>
                                                💵 {p.price
                                                    ? Number(p.price).toLocaleString('es-AR', {
                                                        style: 'currency',
                                                        currency: 'ARS'
                                                    })
                                                    : '-'}
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
    );
};

export default PassengersListPage;
