import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RecommendationDetailPage.module.css';
import { recoUrl } from '../config/mediaPaths';


const safeRecoUrl = (name) => {
    if (!name || typeof name !== 'string') return '';
    if (/^https?:\/\//i.test(name)) return name;
    if (typeof recoUrl === 'function') {
        return recoUrl(name);
    }
    const base = String(recoUrl).replace(/\/$/, '');
    return `${base}/${encodeURIComponent(name)}`;
};

const RecommendationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/recommendations/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (alive) setRecommendation(data);
            } catch (err) {
                if (alive) setError('No se pudo cargar la recomendación.');
                console.error('Error al cargar recomendación:', err);
            } finally {
                if (alive) setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })();
        return () => { alive = false; };
    }, [id]);

    if (loading) return <p className={styles.detailContainer}>Cargando...</p>;
    if (error || !recommendation) {
        return (
            <div className={styles.detailContainer}>
                <header className={styles.detailHeader}>
                    <h2 className={styles.title}>Recomendación</h2>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>← Volver</button>
                </header>
                <p>{error || 'Detalle no disponible.'}</p>
            </div>
        );
    }

    const {
        title,
        longDescription,
        mainImage,
        imageUrl,  
        image1, image2, image3, image4,
    } = recommendation;

    const mainSrc = safeRecoUrl(mainImage || imageUrl);
    const gallery = [image1, image2, image3, image4].filter(Boolean).map(safeRecoUrl);

    return (
        <div className={styles.detailContainer}>
            <header className={styles.detailHeader}>
                <h2 className={styles.title}>{title}</h2>
                <button className={styles.backButton} onClick={() => navigate(-1)}>← Volver</button>
            </header>

            <div className={styles.detailContent}>
                {longDescription && (
                    <p className={styles.description}>{longDescription}</p>
                )}

                <div className={styles.galleryBlock}>
                    {mainSrc && (
                        <div className={styles.mainImage}>
                            <img
                                src={mainSrc}
                                alt={title}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    )}

                    {gallery.length > 0 && (
                        <div className={styles.gridImages}>
                            {gallery.map((src, index) => (
                                <div key={index} className={styles.gridItem}>
                                    <img
                                        src={src}
                                        alt={`${title} ${index + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecommendationDetailPage;
