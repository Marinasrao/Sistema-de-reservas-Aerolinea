import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RecommendationDetailForm.module.css';
import {
  getRecommendationById,
  saveRecommendationDetails,
  getAllRecommendations,
} from '../services/api';
import { recoUrl } from '../config/mediaPaths';

const safeRecoUrl = (name) => {
  if (!name || typeof name !== 'string') return '';
  const clean = encodeURIComponent(name);
  if (typeof recoUrl === 'function') return recoUrl(name);
  return /^https?:\/\//.test(name) ? name : `${recoUrl}/${clean}`;
};

const RecommendationDetailForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  
  const [longDescription, setLongDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);          
  const [previewUrl, setPreviewUrl] = useState('');          
  const [additionalImages, setAdditionalImages] = useState([null, null, null, null]); 
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  
  const mainInputRef = useRef(null);
  const addInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  
  useEffect(() => {
    let revoked = [];

    const load = async () => {
      if (id && !isNaN(Number(id))) {
        try {
          const detail = await getRecommendationById(id);
          setLongDescription(detail?.longDescription || '');

          
          if (detail?.mainImage) {
            setPreviewUrl(safeRecoUrl(detail.mainImage));
          } else {
            setPreviewUrl('');
          }

          
          const imgs = [null, null, null, null];
          if (detail?.image1) imgs[0] = { preview: safeRecoUrl(detail.image1), name: detail.image1 };
          if (detail?.image2) imgs[1] = { preview: safeRecoUrl(detail.image2), name: detail.image2 };
          if (detail?.image3) imgs[2] = { preview: safeRecoUrl(detail.image3), name: detail.image3 };
          if (detail?.image4) imgs[3] = { preview: safeRecoUrl(detail.image4), name: detail.image4 };
          setAdditionalImages(imgs);
        } catch (e) {
          console.error('No se pudieron cargar detalles', e);
        }
      }

      try {
        const list = await getAllRecommendations();
        setRecommendations(Array.isArray(list) ? list : []);
      } catch (e) {
        setRecommendations([]);
      }
    };

    load();

    return () => {
      
      revoked.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [id]);

  
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2500);
    return () => clearTimeout(t);
  }, [message]);

  
  const handleMainImageChange = (file) => {
    
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setMainImage(file || null);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleAdditionalImageChange = (index, file) => {
    
    const prev = additionalImages[index]?.preview;
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);

    const updated = [...additionalImages];
    updated[index] = file
      ? { file, name: file.name, preview: URL.createObjectURL(file) }
      : null;
    setAdditionalImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('longDescription', longDescription || '');
    if (mainImage) formData.append('mainImage', mainImage);
    additionalImages.forEach((img, idx) => {
      if (img?.file) formData.append(`image${idx + 1}`, img.file);
    });

    try {
      await saveRecommendationDetails(id, formData); 
      setMessage('✅ Detalles guardados');

      
      setMainImage(null);
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const detail = await getRecommendationById(id);
      setPreviewUrl(detail?.mainImage ? safeRecoUrl(detail.mainImage) : '');

      const imgs = [null, null, null, null];
      if (detail?.image1) imgs[0] = { preview: safeRecoUrl(detail.image1), name: detail.image1 };
      if (detail?.image2) imgs[1] = { preview: safeRecoUrl(detail.image2), name: detail.image2 };
      if (detail?.image3) imgs[2] = { preview: safeRecoUrl(detail.image3), name: detail.image3 };
      if (detail?.image4) imgs[3] = { preview: safeRecoUrl(detail.image4), name: detail.image4 };
      setAdditionalImages(imgs);

      if (mainInputRef.current) mainInputRef.current.value = '';
      addInputRefs.forEach((r) => r.current && (r.current.value = ''));
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al guardar los detalles');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Detalle de la Recomendación</h2>

      {!id || isNaN(Number(id)) ? (
        <p className={styles.alert}>
          Estás en modo de gestión general. Hacé clic en "Editar detalles" para modificar descripción e imágenes de un destino.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Descripción larga */}
          <label>Descripción larga:</label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            required
            className={styles.textarea}
            placeholder="Contá el detalle del destino…"
          />

          {/* Imagen principal */}
          <div className={styles.imageBlock}>
            <label>Imagen principal:</label>
            <div className={styles.fileCol}>
              <input
                className={styles.fileInput}
                ref={mainInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleMainImageChange(e.target.files?.[0] || null)}
                onClick={(e) => (e.target.value = null)}
              />
              {mainImage?.name && <div className={styles.fileName}>{mainImage.name}</div>}
            </div>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview principal"
                className={styles.imagePreview}
                loading="lazy"
              />
            )}
          </div>

          {/* Imágenes adicionales */}
          <label>Imágenes adicionales (hasta 4):</label>
          <div className={styles.imageGroup}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.imageItem}>
                <label>Imagen {i + 1}:</label>
                <div className={styles.fileCol}>
                  <input
                    className={styles.fileInput}
                    ref={addInputRefs[i]}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAdditionalImageChange(i, e.target.files?.[0] || null)}
                    onClick={(e) => (e.target.value = null)}
                  />
                  {additionalImages[i]?.name && (
                    <div className={styles.fileName}>{additionalImages[i].name}</div>
                  )}
                </div>

                {additionalImages[i]?.preview && (
                  <img
                    src={additionalImages[i].preview}
                    alt={`Preview ${i + 1}`}
                    className={styles.imagePreview}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit">Guardar detalles</button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
      )}

      <h3>Recomendaciones cargadas:</h3>
      <div className={styles.cardGrid}>
        {recommendations.map((rec) => {
          const isComplete = Boolean(rec.longDescription && rec.mainImage);
          const cardImg = rec?.imageUrl ? safeRecoUrl(rec.imageUrl) : '';
          return (
            <div key={rec.id} className={styles.card}>
              <div>
                {cardImg ? (
                  <img
                    src={cardImg}
                    alt={rec.title}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.noImage}>Sin imagen</div>
                )}
              </div>
              <h4>{rec.title}</h4>
              <p className={isComplete ? styles.complete : styles.incomplete}>
                {isComplete ? '✅ Detalles completos' : '❌ Faltan detalles'}
              </p>
              <button onClick={() => navigate(`/admin/recommendation-details/${rec.id}`)}>
                Editar detalles
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationDetailForm;
