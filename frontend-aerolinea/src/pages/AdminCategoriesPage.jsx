import React, { useState, useEffect } from 'react';
import styles from './AdminCategoriesPage.module.css';
import { getAllCategories, saveCategory } from '../services/api';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
      }
    };
    load();
  }, []);

  const handleTitleChange = (id, value) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, title: value } : cat))
    );
  };

  const handlePromoChange = (id, value) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, promoText: value } : cat))
    );
  };

  const handleImageChange = (id, file) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, imageFile: file } : cat))
    );
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('¿Estás segura de eliminar esta categoría?');
    if (!confirm) return;

    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      alert('✅ Categoría eliminada');
    } catch (err) {
      console.error('Error al eliminar categoría', err);
      alert('❌ No se pudo eliminar la categoría');
    }
  };


  const handleSave = async (id) => {
    const cat = categories.find(c => c.id === id);
    try {
      const formData = new FormData();
      formData.append('title', cat.title || '');
      formData.append('promoText', cat.promoText || '');
      if (cat.imageFile instanceof File) {
        formData.append('image', cat.imageFile);
      }

      await saveCategory(formData, id);
      alert('✅ Categoría guardada');
    } catch (err) {
      console.error('Error al guardar categoría', err);
      alert('❌ Error al guardar');
    }
  };


  return (
    <div className={styles.container}>
      <h2>Gestión de Categorías</h2>
      <p>Aquí vas a poder crear categorías visuales para clasificar los vuelos.</p>

      <div className={styles.grid}>
        {categories.map(cat => (
          <div key={cat.id} className={styles.card}>
            <input
              type="text"
              value={cat.title}
              onChange={(e) => handleTitleChange(cat.id, e.target.value)}
              placeholder="Nombre de categoría"
              className={styles.input}
            />

            <input
              type="text"
              value={cat.promoText || ''}
              onChange={(e) => handlePromoChange(cat.id, e.target.value)}
              placeholder="Texto promocional (opcional)"
              className={styles.input}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(cat.id, e.target.files[0])}
              className={styles.fileInput}
            />

            {(cat.imageFile || cat.image) && (
              <div className={styles.previewWrapper}>
                <img
                  src={cat.imageFile
                    ? URL.createObjectURL(cat.imageFile)
                    : cat.image}

                  alt="preview"
                  className={styles.preview}
                />
                {cat.promoText && (
                  <div className={styles.promoBadge}>
                    {cat.promoText}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => handleSave(cat.id)} className={styles.button}>
              Guardar
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              className={styles.deleteButton}
            >
              Eliminar
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
