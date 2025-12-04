import React, { useState } from 'react';
import styles from './AdminHeroManager.module.css';

const AdminHeroManager = () => {
    const [images, setImages] = useState([]);
    const [descriptions, setDescriptions] = useState([]);

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const updatedImages = [...images];
            updatedImages[index] = file;
            setImages(updatedImages);
        }
    };

    const handleDescriptionChange = (e, index) => {
        const updatedDescriptions = [...descriptions];
        updatedDescriptions[index] = e.target.value;
        setDescriptions(updatedDescriptions);
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    images.forEach((img, i) => {
        formData.append('images', img);
        formData.append('descriptions', descriptions[i] || '');
    });

    try {
        const response = await fetch('http://localhost:8080/api/hero/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('¡Imágenes guardadas exitosamente!');
        } else {
            alert('Error al guardar imágenes.');
        }
    } catch (error) {
        console.error('Error al subir imágenes:', error);
        alert('Hubo un problema al conectar con el servidor.');
    }
};

    return (
        <div className={styles.container}>
            <h2>Gestión de Portada Principal</h2>
            <p>Sube hasta 3 imágenes para mostrar en la portada principal del sitio.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                {[0, 1, 2].map((index) => (
                    <div key={index} className={styles.imageBlock}>
                        <label>Imagen {index + 1}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                        />

                        {images[index] && (
                            <img
                                src={URL.createObjectURL(images[index])}
                                alt={`Vista previa ${index + 1}`}
                                className={styles.preview}
                            />
                        )}

                        <textarea
                            placeholder="Descripción de la imagen..."
                            value={descriptions[index] || ''}
                            onChange={(e) => handleDescriptionChange(e, index)}
                            className={styles.textarea}
                        />
                    </div>
                ))}

                <button type="submit" className={styles.submitBtn}>
                    Guardar imágenes
                </button>
            </form>
        </div>
    );
};

export default AdminHeroManager;
