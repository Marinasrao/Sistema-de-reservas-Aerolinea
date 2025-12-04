import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './AdminRecommendationsPage.module.css';
import {
  getAllRecommendations,
  getRecommendationById,
  saveRecommendation,
  saveRecommendationDetails,
  deleteRecommendation,
} from '../services/api';
import { recoUrl } from '../config/mediaPaths';

function useFilePreview(file) {
  const [url, setUrl] = React.useState('');
  React.useEffect(() => {
    if (!file) { setUrl(''); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

const AdminRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);

  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [airport, setAirport] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [flightType, setFlightType] = useState('');
  const [mainImageDetail, setMainImageDetail] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [addImages, setAddImages] = useState([null, null, null, null]);
  const [message, setMessage] = useState('');
  const mainLocalPreview = useFilePreview(mainImageDetail);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil((recommendations?.length || 0) / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = Array.isArray(recommendations)
    ? recommendations.slice(start, start + PAGE_SIZE)
    : [];

  const cardImageInputRef = useRef(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const [departureDate, setDepartureDate] = useState('');


  const safeRecoUrl = (name) => {
    if (!name || typeof name !== 'string') return '';
    const clean = encodeURIComponent(name);
    if (typeof recoUrl === 'function') {
      return recoUrl(name);
    }
    return /^https?:\/\//.test(name) ? name : `${recoUrl}/${clean}`;
  };

  const load = useCallback(async () => {
    try {
      const baseList = await getAllRecommendations();
      const list = Array.isArray(baseList) ? baseList : [];
      setRecommendations(list);
      setPage(1);
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setRecommendations([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const fetchVisibleDetails = async () => {
      try {
        if (!Array.isArray(recommendations) || recommendations.length === 0) return;
        const current = recommendations.slice(start, start + PAGE_SIZE);
        const detailList = await Promise.all(
          current.map((r) => getRecommendationById(r.id).catch(() => null))
        );
        const map = new Map(
          detailList
            .filter(Boolean)
            .map((d) => [
              d.id,
              {
                longDescription: d?.longDescription ?? '',
                mainImage: d?.mainImage ?? '',
                image1: d?.image1 ?? '',
                image2: d?.image2 ?? '',
                image3: d?.image3 ?? '',
                image4: d?.image4 ?? '',
              },
            ])
        );
        if (map.size === 0) return;
        setRecommendations((prev) =>
          prev.map((r) => (map.has(r.id) ? { ...r, ...map.get(r.id) } : r))
        );
      } catch (e) {
        console.warn('No se pudieron traer detalles de la página visible', e);
      }
    };
    fetchVisibleDetails();

  }, [page, recommendations.length]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      if (mainImagePreview?.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
      addImages.forEach((img) => {
        if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
      });
    };

  }, []);

  useEffect(() => {
    if (!message) return;
    if (!message.startsWith('✅')) return;
    const t = setTimeout(() => setMessage(''), 2500);
    return () => clearTimeout(t);
  }, [message]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleMainImageDetailChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (mainImagePreview?.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
    setMainImageDetail(file);
    setMainImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleAdditionalChange = (index, file) => {
    if (addImages[index]?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(addImages[index].preview);
    }
    const next = [...addImages];
    next[index] = file ? { file, name: file.name, preview: URL.createObjectURL(file) } : null;
    setAddImages(next);
  };

  const handleEdit = async (id) => {
    setMessage('');
    setEditingId(id);

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => titleInputRef.current?.focus(), 350);

    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    if (mainImagePreview?.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
    addImages.forEach((img) => {
      if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    });

    try {
      const detail = await getRecommendationById(id);
      setImage(null);
      setMainImageDetail(null);
      setTitle(detail.title || '');
      setPreviewUrl(detail.imageUrl ? safeRecoUrl(detail.imageUrl) : '');


      setLongDescription(
        detail.longDescription ??
        detail.long_description ??
        detail.longDesc ??
        detail.longdescription ??
        ''
      );

      setShortDescription(
        detail.shortDescription ??
        detail.short_description ??
        ''
      );
      setFlightType(
        detail.flightType ??
        detail.flight_type ??
        ''
      );
      setAirport(detail.airport ?? '');
      setPrice(detail.price ?? '');
      setDiscountPercent(detail.discountPercent ?? '');
      setDepartureDate(detail.departureDate || '');
      setMainImagePreview(detail.mainImage ? safeRecoUrl(detail.mainImage) : '');



      const imgs = [null, null, null, null];
      if (detail.image1) imgs[0] = { preview: safeRecoUrl(detail.image1), name: detail.image1 };
      if (detail.image2) imgs[1] = { preview: safeRecoUrl(detail.image2), name: detail.image2 };
      if (detail.image3) imgs[2] = { preview: safeRecoUrl(detail.image3), name: detail.image3 };
      if (detail.image4) imgs[3] = { preview: safeRecoUrl(detail.image4), name: detail.image4 };
      setAddImages(imgs);
    } catch (err) {
      console.error('No se pudo precargar detalles', err);
    }
  };


  const handleCancelEdit = () => {
    addImages.forEach((img) => {
      if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    });
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    if (mainImagePreview?.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);

    setEditingId(null);
    setTitle('');
    setImage(null);
    setPreviewUrl('');
    setLongDescription('');
    setMainImageDetail(null);
    setMainImagePreview('');
    setAddImages([null, null, null, null]);
    setMessage('');
    setShortDescription('');
    setFlightType('');
    if (cardImageInputRef.current) cardImageInputRef.current.value = null;
  };

  const handleDelete = async (id) => {
    try {
      const ok = window.confirm('¿Eliminar esta recomendación? Esta acción no se puede deshacer.');
      if (!ok) return;
      await deleteRecommendation(id);
      if (editingId === id) handleCancelEdit();
      await load();
      setMessage('🗑️ Recomendación eliminada');
    } catch (e) {
      console.error('Error al eliminar:', e);
      setMessage('❌ No se pudo eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (!editingId && (!title || !image)) {
        setMessage('❌ Completá título e imagen de la card.');
        return;
      }
      if (editingId && !title) {
        setMessage('❌ El título no puede estar vacío.');
        return;
      }

      let id = editingId || null;

      const formCard = new FormData();
      formCard.append('recommendation', JSON.stringify({
        title,
        airport,
        departureDate,
        price: Number(price),
        discountPercent: Number(discountPercent)
      }));


      if (image) formCard.append('image', image);

      const saved = await saveRecommendation(formCard, editingId);
      if (!id) id = saved?.id;

      if (!id) {
        const list = await getAllRecommendations();
        const byTitle = list.filter((r) => r.title === title);
        const chosen = (byTitle.length ? byTitle : list).reduce(
          (a, b) => (a.id > b.id ? a : b),
          { id: 0 }
        );
        id = chosen?.id || null;
      }

      if (!id) {
        setMessage('❌ La card se guardó pero no pude obtener el ID para detalles.');
        await load();
        return;
      }

      const formDetails = new FormData();
      formDetails.append('longDescription', longDescription || '');
      if (mainImageDetail) formDetails.append('mainImage', mainImageDetail);
      addImages.forEach((item, idx) => {
        if (item?.file) formDetails.append(`image${idx + 1}`, item.file);
      });

      await saveRecommendationDetails(id, formDetails);

      await load();
      handleCancelEdit();
      setMessage('✅ Guardado completo');
      if (cardImageInputRef.current) cardImageInputRef.current.value = null;
    } catch (error) {
      console.error('Error al guardar recomendación:', error);
      setMessage('❌ Error al guardar');


    }
  };

  return (
    <div className={styles.container}>
      <h2>Gestionar Recomendaciones</h2>

      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <fieldset className={styles.fieldset}>
          <legend>Card del Home</legend>

          <label>
            Título:
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required={!editingId}
            />
          </label>

          <label>
            Imagen (card):
            <input
              ref={cardImageInputRef}
              type="file"
              accept="image/*"
              onClick={(e) => (e.target.value = null)}
              onChange={handleImageChange}
              required={!editingId}
            />
          </label>

          {previewUrl && (
            <div className={styles.imageItem}>
              <div className={styles.preview}>
                <img src={previewUrl} alt="Vista previa card" className={styles.image} />
              </div>
            </div>
          )}

        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Detalles del destino</legend>

          {/* Descripción breve para la card */}
          <label>
            Descripción breve (se muestra en la card):
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Ej: Vuelo directo a precio especial. ¡Imperdible!"
              className={styles.textarea}
            />
          </label>



          {/* Tipo de vuelo */}
          <label>
            Tipo de vuelo:
            <input
              type="text"
              value={flightType}
              onChange={(e) => setFlightType(e.target.value)}
              placeholder="Directo / con escala / charter…"
              className={styles.textInput}
            />
          </label>
          {/* Aeropuerto */}
          <label>
            Aeropuerto:
            <input
              type="text"
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              placeholder="Ej: Aeroparque Jorge Newbery"
              className={styles.textInput}
            />
          </label>

          {/* Fecha de ida */}
          <label>
            Fecha de ida:
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={styles.textInput}
            />
          </label>


          {/* Precio promocional */}
          <label>
            Precio promocional (ARS):
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 65000"
              className={styles.textInput}
              min="0"
              step="0.01"
            />
          </label>

          {/* Porcentaje de descuento */}
          <label>
            Descuento (%):
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="Ej: 20"
              className={styles.textInput}
              min="0"
              max="100"
            />
          </label>


          <label>
            Descripción larga:
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="Contá el detalle del destino…"
            />
          </label>

          <div className={styles.imageGroup}>
            <div className={styles.imageItem}>
              <label>Imagen principal (detalles):</label>
              <input
                type="file"
                accept="image/*"
                onClick={(e) => (e.target.value = null)}
                onChange={handleMainImageDetailChange}
              />
              {mainImagePreview && (
                <div className={styles.preview}>
                  <img
                    src={mainImagePreview}
                    alt="Preview mainImage"
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>

          <label>Imágenes adicionales (hasta 4):</label>
          <div className={styles.imageGroup}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.imageItem}>
                <input
                  type="file"
                  accept="image/*"
                  onClick={(e) => (e.target.value = null)}
                  onChange={(e) => handleAdditionalChange(i, e.target.files?.[0] || null)}
                />
                {addImages[i]?.preview && (
                  <div className={styles.preview}>
                    <img
                      src={addImages[i].preview}
                      alt={`Preview ${i + 1}`}
                      className={styles.image}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <button type="submit" className={styles.updateButton}>
            {editingId ? 'Actualizar' : 'Agregar'}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>
              Cancelar edición
            </button>
          )}
        </div>

        {message && <div className={styles.message}>{message}</div>}
      </form>


      <div className={styles.grid}>
        {visible && visible.length > 0 ? (
          visible.map((rec) => {
            const imgSrc = rec?.imageUrl ? safeRecoUrl(rec.imageUrl) : null;
            const isComplete = Boolean(rec?.longDescription && rec?.mainImage);

            return (
              <div key={rec.id} className={styles.card}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={rec?.title ?? 'Destino'}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"

                  />
                ) : (
                  <div className={styles.noImage}>Sin imagen</div>
                )}

                <h3>{rec?.title ?? 'Sin título'}</h3>

                <p className={isComplete ? styles.complete : styles.incomplete}>
                  {isComplete ? '✅ Detalles completos' : '❌ Faltan detalles'}
                </p>

                <div className={styles.buttonGroup}>
                  <button onClick={() => handleEdit(rec.id)} className={styles.editButton}>Editar</button>
                  <button onClick={() => handleDelete(rec.id)}>Eliminar</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noResults}>No hay recomendaciones para mostrar.</div>
        )}
      </div>


      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ◀ Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRecommendationsPage;
