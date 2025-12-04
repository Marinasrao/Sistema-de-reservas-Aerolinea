import React, { useEffect, useState } from 'react';
import styles from './PassengersListPage.module.css';
import { deletePassenger, getAllPassengers } from '../services/api';

const PassengersListPage = () => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPassengers = async () => {
        try {
            const data = await getAllPassengers();
            setPassengers(data);
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

    if (loading) return <div className={styles.loader}>Cargando pasajeros...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Listado de Pasajeros</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>DNI/ Pasaporte</th>
                        <th>Email</th>
                        <th>N° Vuelo</th>
                        <th> Origen</th>
                        <th>Destino</th>
                        <th>Clase</th>
                        <th>Asiento</th>
                        <th>Valor</th>
                        <th>Fecha de Compra</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {passengers.length > 0 ? (
                        passengers.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.firstName}</td>
                                <td>{p.lastName}</td>
                                <td>{p.documentNumber}</td>
                                <td>{p.email}</td>
                                <td>{p.flightNumber || '-'}</td>
                                <td>{p.origin || '_'}</td>
                                <td>{p.destination || '_'}</td>
                                <td>{p.flightClass}</td>
                                <td>{p.seatNumber}</td>

                                <td>
                                    {p.price
                                        ? Number(p.price).toLocaleString('es-AR', {
                                            style: 'currency',
                                            currency: 'ARS'
                                        })
                                        : '-'}
                                </td>
                                <td>{p.purchasedAt ? new Date(p.purchasedAt).toLocaleDateString('es-AR') : '-'}</td>
                                <td>
                                    <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>
                                        Eliminar
                                    </button>
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="13" style={{ textAlign: 'center' }}>No hay pasajeros registrados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PassengersListPage;
