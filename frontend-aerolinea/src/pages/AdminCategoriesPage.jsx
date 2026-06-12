import React, { useState, useEffect } from "react";
import styles from "./AdminCategoriesPage.module.css";
import { getAllCategories, saveCategory, deleteCategory } from "../services/api";
import CategoryPromosBlock from "./CategoryPromosBlock";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [openPromos, setOpenPromos] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar categorías", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    const alreadyCreating = categories.some((cat) => cat.isNew);

    if (alreadyCreating) {
      alert("Ya tenés una categoría nueva pendiente de guardar.");
      return;
    }

    const newCategory = {
      id: `new-${Date.now()}`,
      title: "",
      promoText: "",
      image: "",
      imageFile: null,
      isNew: true,
    };

    setCategories((prev) => [newCategory, ...prev]);
    setEditingCategoryId(newCategory.id);
    setOpenPromos(null);
  };

  const handleEditCategory = (id) => {
    setEditingCategoryId(id);
    setOpenPromos(null);
  };

  const handleCancelEdit = async (id) => {
    const category = categories.find((cat) => cat.id === id);

    if (category?.isNew) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setEditingCategoryId(null);
      return;
    }

    setEditingCategoryId(null);
    await loadCategories();
  };

  const handleTitleChange = (id, value) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, title: value } : cat))
    );
  };

  const handlePromoChange = (id, value) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, promoText: value } : cat))
    );
  };

  const handleImageChange = (id, file) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, imageFile: file } : cat))
    );
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás segura de eliminar esta categoría?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      alert("✅ Categoría eliminada");
    } catch (err) {
      console.error("Error al eliminar categoría", err);
      alert("❌ No se pudo eliminar la categoría");
    }
  };

  const handleSave = async (id) => {
    const cat = categories.find((c) => c.id === id);

    if (!cat) return;

    if (!cat.title || !cat.title.trim()) {
      alert("⚠️ Ingresá un nombre para la categoría.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", cat.title.trim());
      formData.append("promoText", cat.promoText || "");

      if (cat.imageFile instanceof File) {
        formData.append("image", cat.imageFile);
      }

      if (cat.isNew) {
        await saveCategory(formData);
        alert("✅ Categoría creada");
      } else {
        await saveCategory(formData, id);
        alert("✅ Categoría actualizada");
      }

      await loadCategories();
      setEditingCategoryId(null);
      setOpenPromos(null);
    } catch (err) {
      console.error("Error al guardar categoría", err);
      alert("❌ Error al guardar");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          
          <h2>Gestión de Categorías</h2>
          <p>
            Creá, editá y organizá las categorías que se muestran en el sitio.
          </p>
        </div>

        <button
          type="button"
          className={styles.addCategoryButton}
          onClick={handleAddCategory}
        >
          + Agregar categoría
        </button>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => {
          const isEditing = editingCategoryId === cat.id;
          const canEdit = cat.isNew || isEditing;

          return (
            <div
              key={cat.id}
              className={`${styles.card} ${cat.isNew ? styles.newCard : ""}`}
            >
              {cat.isNew && (
                <span className={styles.newBadge}>Nueva Categoria</span>
              )}

              {!cat.isNew && !isEditing && (
                <span className={styles.viewBadge}>Categoría existente</span>
              )}

              {!cat.isNew && isEditing && (
                <span className={styles.editBadge}>Editando categoría</span>
              )}

              <input
                type="text"
                value={cat.title || ""}
                onChange={(e) => handleTitleChange(cat.id, e.target.value)}
                placeholder="Nombre de categoría"
                className={styles.input}
                disabled={!canEdit}
              />

              {!(cat.imageFile || cat.image) && (
                <input
                  type="text"
                  value={cat.promoText || ""}
                  onChange={(e) => handlePromoChange(cat.id, e.target.value)}
                  placeholder="Texto promocional (opcional)"
                  className={styles.input}
                  disabled={!canEdit}
                />
              )}

              {canEdit && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(cat.id, e.target.files[0])
                    }
                    className={styles.fileInputHidden}
                    id={`file-${cat.id}`}
                  />

                  <label
                    htmlFor={`file-${cat.id}`}
                    className={styles.imageButton}
                  >
                    {cat.image || cat.imageFile
                      ? "Cambiar imagen"
                      : "Seleccionar imagen"}
                  </label>
                </>
              )}

              {(cat.imageFile || cat.image) && (
                <div className={styles.previewWrapper}>
                  <img
                    src={
                      cat.imageFile
                        ? URL.createObjectURL(cat.imageFile)
                        : cat.image
                        ? `http://localhost:8080/uploads/categories/${cat.image}`
                        : undefined
                    }
                    alt="preview"
                    className={styles.preview}
                  />

                  {cat.promoText && (
                    <div className={styles.promoBadge}>{cat.promoText}</div>
                  )}
                </div>
              )}

              <div className={styles.cardActions}>
                {canEdit ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSave(cat.id)}
                      className={styles.button}
                    >
                      {cat.isNew ? "Crear categoría" : "Guardar cambios"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancelEdit(cat.id)}
                      className={styles.deleteButton}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditCategory(cat.id)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className={styles.deleteButton}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>

              {!cat.isNew && !isEditing && (
                <>
                  <button
                    type="button"
                    className={styles.togglePromosBtn}
                    onClick={() =>
                      setOpenPromos(openPromos === cat.id ? null : cat.id)
                    }
                  >
                    {openPromos === cat.id
                      ? "Ocultar ▲"
                      : "Gestionar Filtrado Categorías ▼"}
                  </button>

                  {openPromos === cat.id && (
                    <div className={styles.promosWrapper}>
                      <CategoryPromosBlock categoryId={cat.id} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;