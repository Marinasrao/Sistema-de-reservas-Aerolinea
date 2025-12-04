import React, { useState } from 'react';
import styles from './HeroManager.module.css';

const HeroManager = () => {
    const [slides, setSlides] = useState([
        { image: null, description: '' }
    ]);

    const handleImageChange = (index, file) => {
        const updated = [...slides];
        updated[index].image = file;
        setSlides(updated);
    };

    const handleRemoveImage = (index) => {
        const updated = [...slides];
        updated[index].image = null;
        setSlides(updated);
    };

    const handleDescriptionChange = (index, value) => {
        const updated = [...slides];
        updated[index].description = value;
        setSlides(updated);
    };

    const handleAddSlide = () => {
        if (slides.length < 3) {
            setSlides([...slides, { image: null, description: '' }]);
        }
    };

    const handleRemoveSlide = (index) => {
        const updated = slides.filter((_, i) => i !== index);
        setSlides(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        slides.forEach((slide) => {
            if (slide.image) {
                formData.append('images', slide.image);
                formData.append('descriptions', slide.description);
            }
        });

        try {
            const response = await fetch('http://localhost:8080/api/hero/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error al guardar la portada');

            alert('Portada actualizada correctamente');
        } catch (error) {
            console.error(error);
            alert('Hubo un error al subir las imágenes');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Gestionar Portada Principal</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {slides.map((slide, index) => (
                    <div className={styles.managerSlide}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                            required
                        />
                        
                        {slide.image && (
                            <div className={styles.filename}>
                                Archivo: <strong>{slide.image.name}</strong>
                            </div>
                        )}
                        
                        {slide.image && (
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className={styles.removeImageBtn}
                            >
                                Eliminar imagen seleccionada
                            </button>
                        )}
                        <textarea
                            placeholder="Descripción de la imagen"
                            value={slide.description}
                            onChange={(e) => handleDescriptionChange(index, e.target.value)}
                            required
                        />
                        {slides.length > 1 && (
                            <button type="button" onClick={() => handleRemoveSlide(index)}>
                                Eliminar bloque
                            </button>
                        )}
                    </div>
                ))}
                {slides.length < 3 && (
                    <button type="button" onClick={handleAddSlide}>
                        + Agregar otra imagen
                    </button>
                )}
                <button type="submit">Guardar Portada</button>
            </form>
        </div>
    );
};

export default HeroManager;
