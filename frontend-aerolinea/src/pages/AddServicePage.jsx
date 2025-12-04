import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddServicePage.css';
import { createService } from '../services/api';
import { validateService } from '../utils/validation';

const AddServicePage = ({ editMode }) => {
    const navigate = useNavigate();
    const [service, setService] = useState({
        name: '',
        description: '',
        price: '',
        category: 'food'
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateService(service);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await createService(service);
            navigate('/admin/services');
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };

    return (
        <div className={styles.container}>
            <h1>{editMode ? 'Editar' : 'Agregar'} Servicio</h1>
            
            <form onSubmit={handleSubmit}>
                
            </form>
        </div>
    );
};

export default AddServicePage;