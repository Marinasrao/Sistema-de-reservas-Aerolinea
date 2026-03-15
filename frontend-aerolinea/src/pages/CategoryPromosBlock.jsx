import { useState, useEffect } from "react";
import styles from "./CategoryPromosBlock.module.css";

const API_BASE = "http://localhost:8080/api";

const CategoryPromosBlock = ({ categoryId }) => {
    const [promos, setPromos] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadPromos = async () => {
        if (!categoryId) return;

        try {
            const res = await fetch(
                `${API_BASE}/categories/${categoryId}/promos`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const data = await res.json();

            const mapped = data.map(promo => ({
                id: promo.id,
                existingImage: promo.image,
                imageFile: null,
                promoText: promo.promoText || ""
            }));

            setPromos(mapped);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadPromos();
    }, [categoryId]);

    const addPromo = () => {
        setPromos(prev => [
            ...prev,
            {
                id: null,
                existingImage: null,
                imageFile: null,
                promoText: ""
            }
        ]);
    };

    const removePromo = (index) => {
        setPromos(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (index, file) => {
        setPromos(prev => {
            const copy = [...prev];
            copy[index].imageFile = file;
            return copy;
        });
    };

    const handleTextChange = (index, value) => {
        setPromos(prev => {
            const copy = [...prev];
            copy[index].promoText = value;
            return copy;
        });
    };

    const handleSave = async () => {
        if (!categoryId) return;

        const formData = new FormData();

        promos.forEach(promo => {
            formData.append("promoTexts", promo.promoText || "");
            formData.append("images", promo.imageFile);
        });

        setSaving(true);

        try {
            const res = await fetch(
                `${API_BASE}/categories/admin/${categoryId}/promos`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Error al guardar promociones");
            }

            await loadPromos();
            alert("Promociones guardadas correctamente");
        } catch (err) {
            console.error(err);
            alert("Error al guardar promociones");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className={styles.container}>
            <h3 className={styles.title}>Promociones del Filtrado</h3>

            <div className={styles.grid}>
                {promos.map((promo, index) => (
                    <div key={index} className={styles.card}>

                        <label className={styles.label}>
                            Imagen
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={e =>
                                handleImageChange(index, e.target.files[0])
                            }
                        />

                        {(promo.imageFile || promo.existingImage) && (
                            <img
                                src={
                                    promo.imageFile
                                        ? URL.createObjectURL(promo.imageFile)
                                        : `http://localhost:8080/uploads/categories/${promo.existingImage}`
                                }
                                alt="preview"
                                className={styles.preview}
                            />
                        )}

                        <label className={styles.label}>
                            Texto promoción
                        </label>

                        <input
                            type="text"
                            placeholder="Ej: Desde $39.999"
                            value={promo.promoText}
                            onChange={e =>
                                handleTextChange(index, e.target.value)
                            }
                        />

                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => removePromo(index)}
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={addPromo}
                >
                    + Agregar promoción
                </button>

                <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Guardando..." : "Guardar promociones"}
                </button>
            </div>
        </section>
    );
};

export default CategoryPromosBlock;

