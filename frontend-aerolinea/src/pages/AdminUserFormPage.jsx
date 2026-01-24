import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminUserForm from "../components/AdminUserForm";
import { createAdmin, updateAdmin, deleteAdmin, getAdmins } from "../services/adminUsersService";
import styles from "./AdminUserFormPage.module.css";

const AdminUserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setError("");
      const admins = await getAdmins();
      const admin = Array.isArray(admins) ? admins.find((a) => a.id === Number(id)) : null;
      setUser(admin || null);
    } catch (e) {
      setError(e?.message || "Error al cargar administrador");
    }
  };

  const handleSave = async (data) => {
    try {
      setError("");
      setIsSaving(true);

      if (isEdit) {
        await updateAdmin(id, data);
      } else {
        await createAdmin(data);
      }

      navigate("/admin/admin-users");
    } catch (e) {
      setError(e?.message || "Error al guardar administrador");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("¿Eliminar este administrador?");
    if (!ok) return;

    try {
      setError("");
      setIsSaving(true);
      await deleteAdmin(id);
      navigate("/admin/admin-users");
    } catch (e) {
      setError(e?.message || "Error al eliminar administrador");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitClick = () => {
    const formEl = document.getElementById("adminUserForm");
    if (!formEl) return;
    formEl.requestSubmit();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Editar administrador" : "Nuevo administrador"}</h2>
          <p className={styles.subtitle}>
            {isEdit ? "Actualizá los datos del administrador." : "Completá los datos para crear un administrador."}
          </p>
        </div>

        <div className={styles.formWrap}>
          <AdminUserForm user={user} onSubmit={handleSave} disabled={isSaving} />
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
            onClick={handleSubmitClick}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
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
