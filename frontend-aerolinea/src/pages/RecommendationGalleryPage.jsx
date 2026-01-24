import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RecommendationGalleryPage.module.css';
import { recoUrl } from '../config/mediaPaths';

const RecommendationGalleryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/recommendations/${id}`);
        const data = await res.json();
        setRecommendation(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (!recommendation) return <p>Error al cargar la galería.</p>;

  
  const images = [
    recommendation.mainImage || recommendation.imageUrl,
    recommendation.image1,
    recommendation.image2,
    recommendation.image3,
    recommendation.image4
  ]
    .filter(Boolean)
    .map(file => recoUrl(file)); 

  return (
    <div className={styles.galleryPage}>
      <header className={styles.header}>
        <h2 className={styles.title}>Galería</h2>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Volver</button>
      </header>

      <div className={styles.galleryGrid}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Imagen ${i + 1}`} className={styles.galleryImg} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationGalleryPage;
