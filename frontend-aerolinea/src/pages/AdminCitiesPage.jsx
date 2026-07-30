import { useEffect, useMemo, useState } from "react";
import styles from "./AdminCitiesPage.module.css";

const API_URL = "http://localhost:8080/api/admin/cities";

const INITIAL_FORM = {
  id: null,
  name: "",
  country: "",
  airportCode: "",
  active: true,
};

const readResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const AdminCitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  const token = localStorage.getItem("token");
  const isEditing = Boolean(form.id);

  const showFeedback = (message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);
  };

  const loadCities = async () => {
    setLoading(true);

    try {
      if (!token) {
        throw new Error("No se encontró el token de autenticación.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "No se pudo obtener el catálogo de ciudades.",
        );
      }

      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      showFeedback(
        error.message || "Ocurrió un error al cargar las ciudades.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const filteredCities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    if (!normalizedSearch) {
      return cities;
    }

    return cities.filter((city) => {
      const values = [
        city.name || "",
        city.country || "",
        city.airportCode || "",
      ];

      return values.some((value) =>
        value.toLocaleLowerCase("es").includes(normalizedSearch),
      );
    });
  }, [cities, search]);

  const activeCities = useMemo(
    () => cities.filter((city) => city.active).length,
    [cities],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "airportCode" ? value.toUpperCase() : value,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cityName = form.name.trim();

    if (!cityName) {
      showFeedback("Ingresá el nombre de la ciudad.", "error");
      return;
    }

    setSaving(true);
    setFeedback("");

    const payload = {
      name: cityName,
      country: form.country.trim() || null,
      airportCode: form.airportCode.trim().toUpperCase() || null,
      active: form.active,
    };

    const endpoint = isEditing ? `${API_URL}/${form.id}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "No se pudo actualizar la ciudad."
              : "No se pudo agregar la ciudad."),
        );
      }

      showFeedback(
        isEditing
          ? "Ciudad actualizada correctamente."
          : "Ciudad agregada correctamente.",
      );

      resetForm();
      await loadCities();
    } catch (error) {
      showFeedback(
        error.message || "Ocurrió un error al guardar la ciudad.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (city) => {
    setForm({
      id: city.id,
      name: city.name || "",
      country: city.country || "",
      airportCode: city.airportCode || "",
      active: city.active,
    });

    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (city) => {
    const action = city.active ? "desactivar" : "activar";

    const confirmed = window.confirm(
      `¿Deseás ${action} la ciudad ${city.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setChangingId(city.id);
    setFeedback("");

    try {
      const response = await fetch(`${API_URL}/${city.id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || `No se pudo ${action} la ciudad.`,
        );
      }

      if (form.id === city.id) {
        resetForm();
      }

      showFeedback(
        city.active
          ? "Ciudad desactivada correctamente."
          : "Ciudad activada correctamente.",
      );

      await loadCities();
    } catch (error) {
      showFeedback(
        error.message || "No se pudo cambiar el estado de la ciudad.",
        "error",
      );
    } finally {
      setChangingId(null);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Catálogo general</span>
          <h1 className={styles.title}>Gestión de ciudades</h1>
          <p className={styles.description}>
            Administrá los destinos disponibles para vuelos, pasajeros,
            reservas y buscadores.
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <strong>{cities.length}</strong>
            <span>Ciudades</span>
          </div>

          <div className={styles.summaryItem}>
            <strong>{activeCities}</strong>
            <span>Activas</span>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={`${styles.feedback} ${
            feedbackType === "error"
              ? styles.feedbackError
              : styles.feedbackSuccess
          }`}
        >
          {feedback}
        </div>
      )}

      <section className={styles.formCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>{isEditing ? "Editar ciudad" : "Agregar nueva ciudad"}</h2>
            <p>
              El nombre es obligatorio. El país y el código de aeropuerto son
              opcionales.
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Ciudad</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ejemplo: Florianópolis"
              maxLength={120}
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="country">País</label>
            <input
              id="country"
              name="country"
              type="text"
              value={form.country}
              onChange={handleChange}
              placeholder="Ejemplo: Brasil"
              maxLength={120}
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="airportCode">Código de aeropuerto</label>
            <input
              id="airportCode"
              name="airportCode"
              type="text"
              value={form.airportCode}
              onChange={handleChange}
              placeholder="Ejemplo: FLN"
              maxLength={10}
              disabled={saving}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Agregar ciudad"}
            </button>

            {isEditing && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <div>
            <h2>Ciudades registradas</h2>
            <p>Las ciudades inactivas no aparecen en los selectores públicos.</p>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar ciudad, país o código"
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.stateMessage}>Cargando ciudades...</div>
        ) : filteredCities.length === 0 ? (
          <div className={styles.stateMessage}>
            No se encontraron ciudades.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ciudad</th>
                  <th>País</th>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredCities.map((city) => (
                  <tr key={city.id}>
                    <td>
                      <span className={styles.cityName}>{city.name}</span>
                    </td>

                    <td>{city.country || "Sin especificar"}</td>

                    <td>
                      {city.airportCode ? (
                        <span className={styles.airportCode}>
                          {city.airportCode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          city.active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {city.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => handleEdit(city)}
                          disabled={changingId === city.id}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            city.active
                              ? styles.deactivateButton
                              : styles.activateButton
                          }
                          onClick={() => handleToggleStatus(city)}
                          disabled={changingId === city.id}
                        >
                          {changingId === city.id
                            ? "Procesando..."
                            : city.active
                              ? "Desactivar"
                              : "Activar"}
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
    </main>
  );
};

export default AdminCitiesPage;