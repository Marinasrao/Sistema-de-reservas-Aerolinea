import { useEffect, useState } from "react";
import styles from "./AdminPoliciesPage.module.css";

const API_BASE = "http://localhost:8080/api";

const initialForm = {
    title: "",
    description: "",
    displayOrder: 1,
    active: true,
};

const getStoredToken = () => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken") ||
        ""
    );
};

const AdminPoliciesPage = () => {
    const [policies, setPolicies] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = getStoredToken();

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE}/admin/policies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("No se pudieron cargar las políticas");
            }

            const data = await res.json();
            setPolicies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando políticas:", err);
            setPolicies([]);
            setError("No se pudieron cargar las políticas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            setError("El título y la descripción son obligatorios.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const url = editingId
                ? `${API_BASE}/admin/policies/${editingId}`
                : `${API_BASE}/admin/policies`;

            const method = editingId ? "PUT" : "POST";

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                active: Boolean(formData.active),
                displayOrder: Number(formData.displayOrder) || 0,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("No se pudo guardar la política");
            }

            setMessage(editingId ? "Política actualizada correctamente." : "Política creada correctamente.");
            setFormData(initialForm);
            setEditingId(null);
            await fetchPolicies();
        } catch (err) {
            console.error("Error guardando política:", err);
            setError("No se pudo guardar la política.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (policy) => {
        setEditingId(policy.id);
        setFormData({
            title: policy.title || "",
            description: policy.description || "",
            displayOrder: policy.displayOrder ?? 0,
            active: Boolean(policy.active),
        });
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("¿Querés eliminar esta política?");
        if (!confirmDelete) return;

        try {
            setError("");
            setMessage("");

            const res = await fetch(`${API_BASE}/admin/policies/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("No se pudo eliminar la política");
            }

            setMessage("Política eliminada correctamente.");
            await fetchPolicies();

            if (editingId === id) {
                resetForm();
            }
        } catch (err) {
            console.error("Error eliminando política:", err);
            setError("No se pudo eliminar la política.");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Contenido administrable</span>
                    <h2>Gestionar Políticas</h2>
                    <p>
                        Administrá las políticas que se muestran en el detalle de cada recomendación.
                    </p>
                </div>
            </div>

            <section className={styles.formCard}>
                <div className={styles.formHeader}>
                    <h3>{editingId ? "Editar política" : "Crear nueva política"}</h3>
                    {editingId && (
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={resetForm}
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Título</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ej: Equipaje permitido"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Orden</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detalle de la política que verá el usuario..."
                            rows="4"
                            required
                        />
                    </div>

                    <label className={styles.checkRow}>
                        <input
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                        />
                        <span>Política activa y visible para usuarios</span>
                    </label>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={saving}
                        >
                            {saving
                                ? "Guardando..."
                                : editingId
                                    ? "Actualizar política"
                                    : "Guardar política"}
                        </button>
                    </div>
                </form>
            </section>

            <section className={styles.listCard}>
                <div className={styles.listHeader}>
                    <h3>Políticas cargadas</h3>
                    <span>{policies.length} políticas</span>
                </div>

                {loading ? (
                    <p className={styles.emptyText}>Cargando políticas...</p>
                ) : policies.length === 0 ? (
                    <p className={styles.emptyText}>
                        Todavía no hay políticas cargadas.
                    </p>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {policies.map((policy) => (
                                    <tr key={policy.id}>
                                        <td>{policy.displayOrder}</td>
                                        <td>{policy.title}</td>
                                        <td className={styles.descriptionCell}>
                                            {policy.description}
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.statusBadge} ${policy.active ? styles.active : styles.inactive}`}
                                            >
                                                {policy.active ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button
                                                    type="button"
                                                    className={styles.editButton}
                                                    onClick={() => handleEdit(policy)}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(policy.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminPoliciesPage;