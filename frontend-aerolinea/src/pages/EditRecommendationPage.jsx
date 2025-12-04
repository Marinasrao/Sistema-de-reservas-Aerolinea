import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditRecommendationPage.module.css';

const EditRecommendationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState({ title: '', imageUrl: '' });
    const [newImage, setNewImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');

    // Carga la recomendación existente
    useEffect(() => {
        fetch(`http://localhost:8080/api/recommendations/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setRecommendation(data);
                setPreview(`http://localhost:8080/uploads/recommendations/${data.imageUrl}`);
            })
            .catch(() => setMessage('❌ Error al cargar la recomendación.'));
    }, [id]);

    const handleChange = (e) => {
        setRecommendation({ ...recommendation, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewImage(file);
        setPreview(URL.createObjectURL(file));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('recommendation', JSON.stringify(recommendation));

   
    if (newImage) {
        formData.append('image', newImage);
    } else {
        formData.append('image', new Blob()); 
    }

    try {
        const res = await fetch(`http://localhost:8080/api/recommendations/edit/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (res.ok) {
            setMessage('✅ Recomendación actualizada.');
            setTimeout(() => navigate('/admin/recommendations'), 1500);
        } else {
            const resText = await res.text();
    console.error('Respuesta del backend:', resText);
    setMessage('❌ Error al actualizar.');
        }
    } catch (err) {
        setMessage('❌ Error inesperado.');
    }
};


    return (
        <div className={styles.container}>
            <h2>Editar Recomendación</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                    Nuevo título:
                    <input
                        type="text"
                        name="title"
                        value={recommendation.title || ''}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Cambiar imagen (opcional):
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>

                {preview && <img src={preview} alt="Preview" className={styles.preview} />}

                <button type="submit">Guardar Cambios</button>
                {message && <p className={styles.message}>{message}</p>}
            </form>
        </div>
    );
};

export default EditRecommendationPage;
