import { useEffect, useMemo, useState } from "react";
import styles from "./AdminCharacteristicsPage.module.css";
import {
  getAllCharacteristics,
  createCharacteristic,
  deleteCharacteristic,
  getCategories,
  getCategoryCharacteristics,
  updateCategoryCharacteristics,
} from "../services/adminCharacteristicsService";

const AdminCharacteristicsPage = () => {
  const [categories, setCategories] = useState([]);
  const [allChars, setAllChars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const orderedCategories = useMemo(() => {
    const wanted = ["Nacionales", "Internacionales", "Low Cost", "Lowcost", "Premium"];
    const byTitle = (a, b) => {
      const ia = wanted.findIndex((w) => (a.title || "").toLowerCase() === w.toLowerCase());
      const ib = wanted.findIndex((w) => (b.title || "").toLowerCase() === w.toLowerCase());
      const ra = ia === -1 ? 999 : ia;
      const rb = ib === -1 ? 999 : ib;
      if (ra !== rb) return ra - rb;
      return (a.title || "").localeCompare(b.title || "");
    };
    return [...categories].sort(byTitle);
  }, [categories]);

  useEffect(() => {
    loadBase();
  }, []);

  const loadBase = async () => {
    try {
      setError("");
      setInfo("");
      setLoading(true);
      const [cats, chars] = await Promise.all([getCategories(), getAllCharacteristics()]);
      setCategories(Array.isArray(cats) ? cats : []);
      setAllChars(Array.isArray(chars) ? chars : []);
    } catch (e) {
      setError(e?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const openCategory = async (cat) => {
    try {
      setError("");
      setInfo("");
      setSelectedCategory(cat);
      setSaving(true);
      const assigned = await getCategoryCharacteristics(cat.id);
      const ids = new Set((Array.isArray(assigned) ? assigned : []).map((c) => c.id));
      setSelectedIds(ids);
    } catch (e) {
      setError(e?.message || "Error al cargar características de la categoría");
    } finally {
      setSaving(false);
    }
  };

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveCategory = async () => {
    if (!selectedCategory) return;
    try {
      setError("");
      setInfo("");
      setSaving(true);
      const ids = Array.from(selectedIds);
      await updateCategoryCharacteristics(selectedCategory.id, ids, allChars);

      setInfo("Guardado correctamente");
    } catch (e) {
      setError(e?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const addCharacteristic = async () => {
    const name = newName.trim();
    if (!name) return;

    try {
      setError("");
      setInfo("");
      setSaving(true);
      const created = await createCharacteristic({ name });
      setAllChars((prev) => [created, ...prev]);
      setNewName("");
      setInfo("Característica creada");
    } catch (e) {
      setError(e?.message || "Error al crear característica");
    } finally {
      setSaving(false);
    }
  };

  const removeCharacteristic = async (id) => {
    const ok = window.confirm("¿Eliminar esta característica?");
    if (!ok) return;

    try {
      setError("");
      setInfo("");
      setSaving(true);
      await deleteCharacteristic(id);
      setAllChars((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setInfo("Característica eliminada");
    } catch (e) {
      setError(e?.message || "Error al eliminar característica");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Cargando...</div>;
  }
  
 const getIconForCharacteristic = (name = "") => {
  const key = name.toLowerCase();

  if (key.includes("equipaje") || key.includes("valija")) return "🧳";

  if (
    key.includes("wifi") ||
    key.includes("wi-fi") ||
    key.includes("wi fi")
  )
    return "📶";

  if (
    key.includes("comida") ||
    key.includes("almuerzo") ||
    key.includes("cena")
  )
    return "🍴";

  if (key.includes("asiento")) return "💺";

  if (key.includes("hora") || key.includes("tiempo")) return "⏱️";

  if (key.includes("prioridad")) return "⭐";

  if (key.includes("check")) return "🛂";

  if (key.includes("mascota") || key.includes("pet")) return "🐶";

  return "✔️";
};



  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Administrar características</h2>
          <p className={styles.subtitle}>Asigná características por categoría (Nacionales, Internacionales, Lowcost).</p>
        </div>

        {(error || info) && (
          <div className={error ? styles.error : styles.info}>
            {error || info}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Categorías</h3>
          <div className={styles.grid}>
            {orderedCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.catCard} ${selectedCategory?.id === c.id ? styles.active : ""}`}
                onClick={() => openCategory(c)}
                disabled={saving}
              >
                <div className={styles.catIcon}>
                  {c.title === "Nacionales" && "🇦🇷"}
                  {c.title === "Internacionales" && "🌍"}
                  {(c.title === "Low Cost" || c.title === "Lowcost") && "💸"}
                  {c.title === "Premium" && "💎"}
                </div>

                <div className={styles.catTitle}>{c.title}</div>

                <div className={styles.catMeta}>
                  {c.promoText || "Explorá las características"}
                </div>
              </button>

            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.row}>
            <h3 className={styles.sectionTitle}>
              {selectedCategory ? `Características de: ${selectedCategory.title}` : "Seleccioná una categoría"}
            </h3>

            <button
              type="button"
              className={styles.primary}
              onClick={saveCategory}
              disabled={!selectedCategory || saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>

          <div className={styles.list}>
            {allChars.map((c) => (
              <div key={c.id} className={styles.item}>
                <div className={styles.left}>
                  <span className={styles.charIcon}>
                    {getIconForCharacteristic(c.name)}
                  </span>

                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleId(c.id)}
                    disabled={!selectedCategory || saving}
                  />

                  <span className={styles.name}>{c.name}</span>
                </div>

                <button
                  type="button"
                  className={styles.linkDanger}
                  onClick={() => removeCharacteristic(c.id)}
                  disabled={saving}
                >
                  Eliminar
                </button>
              </div>

            ))}
          </div>

          <div className={styles.addRow}>
            <input
              className={styles.input}
              placeholder="Nueva característica (ej: Wi-Fi)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={saving}
            />
            <button
              type="button"
              className={styles.secondary}
              onClick={addCharacteristic}
              disabled={saving || !newName.trim()}
            >
              Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharacteristicsPage;
