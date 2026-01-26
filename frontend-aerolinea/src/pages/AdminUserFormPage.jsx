import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmins,
} from "../services/adminUsersService";
import styles from "./AdminUserFormPage.module.css";

const AdminUserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const admins = await getAdmins();
      const admin = admins.find((a) => a.id === Number(id));
      if (admin) {
        setFormData({
          firstName: admin.firstName || "",
          lastName: admin.lastName || "",
          email: admin.email || "",
          password: "",
        });
      }
    } catch {
      setError("Error al cargar administrador");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      if (isEdit) {
        await updateAdmin(id, formData);
      } else {
        await createAdmin(formData);
      }

      navigate("/admin/admin-users");
    } catch {
      setError("Error al guardar administrador");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este administrador?")) return;
    try {
      setIsSaving(true);
      await deleteAdmin(id);
      navigate("/admin/admin-users");
    } catch {
      setError("Error al eliminar administrador");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Editar administrador" : "Nuevo administrador"}
          </h2>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>

          <div className={styles.field}>
            <label>Apellido</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSaving || isEdit}
            />
          </div>

          {!isEdit && (
            <div className={styles.field}>
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => navigate("/admin/admin-users")}
            disabled={isSaving}
          >
            Volver
          </button>

          <button
            type="button"
            className={styles.primary}
            onClick={handleSave}
            disabled={isSaving}
          >
            Guardar
          </button>

          {isEdit && (
            <button
              type="button"
              className={styles.danger}
              onClick={handleDelete}
              disabled={isSaving}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserFormPage;
