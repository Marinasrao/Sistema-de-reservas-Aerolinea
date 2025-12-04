import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ServicesListPage.module.css';
import { getServices } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ServicesListPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getServices();
                setServices(data);
            } catch (err) {
                setError(err.message || 'Error al cargar servicios');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;


    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <h1 className={styles.pageTitle}>Servicios a Bordo</h1>
                <Link to="/admin/add-service" className={styles.addButton}>
                    ＋ Agregar Servicio
                </Link>
            </div>

            <div className={styles.menuGrid}> 
                {services.map(service => (
                    <div key={service._id} className={`${styles.card} ${styles.serviceCard}`}>
                        <div className={styles.serviceContent}>
                            <h3>{service.name || 'Servicio sin nombre'}</h3>
                            <span className={styles.price}>${service.price || '0'}</span>
                            <span className={styles.category}>{service.category || 'Sin categoría'}</span>
                            {service.description && (
                                <p className={styles.description}>{service.description}</p>
                            )}
                            <Link
                                to={`/admin/edit-service/${service._id}`}
                                className={styles.editButton}
                            >
                                Editar
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesListPage;