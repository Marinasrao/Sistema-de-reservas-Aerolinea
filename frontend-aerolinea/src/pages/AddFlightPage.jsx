import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./AddFlightPage.module.css";
import { createFlight, updateFlight, getFlightById } from "../services/api";

function toTimeHHmm(value) {
  if (!value) return "";

  const clean = String(value).replace(/\s/g, "");
  const match = clean.match(/^(\d{2}):(\d{2})/);

  return match ? `${match[1]}:${match[2]}` : clean;
}

function cityCode(city = "") {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");
}

function generateFlightNumber(
  origin,
  destination,
  departureTime,
  airline = "AeroLinea",
) {
  if (!origin || !destination || !departureTime) return "";

  const timeCode = departureTime.replace(":", "");

  const airlineCodes = {
    AeroLinea: "AL",
    SkyWings: "SW",
    GlobalAir: "GA",
    SkyPremium: "SP",
  };

  const airlineCode = airlineCodes[airline] || "AL";

  return `${airlineCode}-${cityCode(origin)}-${cityCode(destination)}-${timeCode}`;
}

const AddFlightPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [flightData, setFlightData] = useState({
    flightNumber: "",
    origin: "Buenos Aires",
    destination: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    price: "",
    economySeats: 120,
    businessSeats: 20,
    firstSeats: 10,
    airline: "AeroLinea",
    aircraftType: "Boeing 737",
    flightStatus: "programado",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCapacity = useMemo(() => {
    return (
      Number(flightData.economySeats || 0) +
      Number(flightData.businessSeats || 0) +
      Number(flightData.firstSeats || 0)
    );
  }, [
    flightData.economySeats,
    flightData.businessSeats,
    flightData.firstSeats,
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesResponse, citiesResponse] = await Promise.all([
          fetch("http://localhost:8080/api/categories"),
          fetch("http://localhost:8080/api/cities"),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error(
            `Error al cargar categorías: ${categoriesResponse.status}`,
          );
        }

        if (!citiesResponse.ok) {
          throw new Error(`Error al cargar ciudades: ${citiesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        const citiesData = await citiesResponse.json();

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        const cityNames = (Array.isArray(citiesData) ? citiesData : [])
          .filter((city) => city?.active !== false)
          .map((city) => city?.name)
          .filter(Boolean)
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        setCities(
          [...new Set(cityNames)].sort((a, b) => a.localeCompare(b, "es")),
        );
      } catch (error) {
        console.error("No se pudieron cargar los datos del formulario:", error);
        setCategories([]);
        setCities([]);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadFlight = async () => {
      try {
        const data = await getFlightById(id);

        setFlightData({
          flightNumber: data.flightNumber || "",
          origin: data.origin || "Buenos Aires",
          destination: data.destination || "",
          departureDate: data.departureDate || "",
          departureTime: toTimeHHmm(data.departureTime),
          arrivalDate: data.arrivalDate || "",
          arrivalTime: toTimeHHmm(data.arrivalTime),
          price: data.price || "",
          economySeats: data.economySeats ?? 120,
          businessSeats: data.businessSeats ?? 20,
          firstSeats: data.firstSeats ?? 10,
          airline: data.airline || "AeroLinea",
          aircraftType: data.aircraftType || "Boeing 737",
          flightStatus: data.flightStatus || "programado",
          categoryId: data.categoryId || "",
        });
      } catch {
        setErrors({
          global: "No se pudo cargar el vuelo para edición.",
        });
      }
    };

    loadFlight();
  }, [id]);

  useEffect(() => {
    const generatedNumber = generateFlightNumber(
      flightData.origin,
      flightData.destination,
      flightData.departureTime,
      flightData.airline,
    );

    setFlightData((previous) => {
      if (previous.flightNumber === generatedNumber) {
        return previous;
      }

      return {
        ...previous,
        flightNumber: generatedNumber,
      };
    });
  }, [
    flightData.origin,
    flightData.destination,
    flightData.departureTime,
    flightData.airline,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "departureTime" || name === "arrivalTime") {
      nextValue = toTimeHHmm(value);
    }

    setFlightData((previous) => {
      const nextData = {
        ...previous,
        [name]: nextValue,
      };

      if (name === "departureDate" && !previous.arrivalDate) {
        nextData.arrivalDate = nextValue;
      }

      if (name === "origin" && nextValue === previous.destination) {
        nextData.destination = "";
      }

      if (name === "destination" && nextValue === previous.origin) {
        nextData.destination = "";
      }

      return nextData;
    });

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!flightData.origin || flightData.origin.trim().length < 3) {
      newErrors.origin = "Seleccioná un origen válido.";
    }

    if (!flightData.destination || flightData.destination.trim().length < 3) {
      newErrors.destination = "Seleccioná un destino válido.";
    }

    if (
      flightData.origin.trim().toLowerCase() ===
      flightData.destination.trim().toLowerCase()
    ) {
      newErrors.destination = "El destino debe ser diferente al origen.";
    }

    if (!flightData.categoryId) {
      newErrors.categoryId = "Seleccioná una categoría.";
    }

    if (!flightData.departureDate) {
      newErrors.departureDate = "Seleccioná una fecha de salida.";
    }

    if (!flightData.departureTime) {
      newErrors.departureTime = "Seleccioná un horario de salida.";
    }

    if (!flightData.arrivalDate) {
      newErrors.arrivalDate = "Seleccioná una fecha de llegada.";
    }

    if (!flightData.arrivalTime) {
      newErrors.arrivalTime = "Seleccioná un horario de llegada.";
    }

    if (
      flightData.departureDate &&
      flightData.departureTime &&
      flightData.arrivalDate &&
      flightData.arrivalTime
    ) {
      const departure = new Date(
        `${flightData.departureDate}T${flightData.departureTime}`,
      );

      const arrival = new Date(
        `${flightData.arrivalDate}T${flightData.arrivalTime}`,
      );

      if (arrival <= departure) {
        newErrors.arrivalDate = "La llegada debe ser posterior a la salida.";
      }
    }

    if (!flightData.price || Number(flightData.price) <= 0) {
      newErrors.price = "Ingresá un precio válido mayor a cero.";
    }

    if (Number(flightData.economySeats) < 0) {
      newErrors.economySeats =
        "La capacidad económica no puede ser negativa.";
    }

    if (Number(flightData.businessSeats) < 0) {
      newErrors.businessSeats =
        "La capacidad ejecutiva no puede ser negativa.";
    }

    if (Number(flightData.firstSeats) < 0) {
      newErrors.firstSeats =
        "La capacidad de primera clase no puede ser negativa.";
    }

    if (totalCapacity <= 0) {
      newErrors.capacity =
        "El vuelo debe tener capacidad disponible en al menos una clase.";
    }

    if (!flightData.flightNumber) {
      newErrors.flightNumber =
        "Completá ruta y horario para generar el número de vuelo.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setErrors((previous) => ({
        ...previous,
        global: "Revisá los datos obligatorios antes de guardar el vuelo.",
      }));
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        flightNumber: flightData.flightNumber,
        origin: flightData.origin.trim(),
        destination: flightData.destination.trim(),
        departureDate: flightData.departureDate,
        departureTime: toTimeHHmm(flightData.departureTime),
        arrivalDate: flightData.arrivalDate,
        arrivalTime: toTimeHHmm(flightData.arrivalTime),
        price: Number(flightData.price),
        economySeats: Number(flightData.economySeats),
        businessSeats: Number(flightData.businessSeats),
        firstSeats: Number(flightData.firstSeats),
        airline: flightData.airline,
        aircraftType: flightData.aircraftType,
        flightStatus: flightData.flightStatus,
        categoryId: Number(flightData.categoryId),
      };

      if (isEditMode) {
        await updateFlight(id, payload);
        alert("Vuelo actualizado correctamente.");
      } else {
        await createFlight(payload);
        alert("Vuelo programado correctamente.");
      }

      navigate("/admin/listar-vuelos");
    } catch (error) {
      setErrors({
        global: error.message || "Ocurrió un error al guardar el vuelo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isEditMode ? "Editar vuelo programado" : "Programar nuevo vuelo"}
      </h1>

      {errors.global && (
        <div className={styles.globalError}>🚫 {errors.global}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <span>01</span>

            <div>
              <h2>Información operativa</h2>
              <p>Definí la aerolínea, el estado y la aeronave asignada.</p>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="airline">Aerolínea</label>

              <select
                id="airline"
                name="airline"
                value={flightData.airline}
                onChange={handleInputChange}
              >
                <option value="AeroLinea">AeroLinea</option>
                <option value="SkyWings">SkyWings</option>
                <option value="GlobalAir">GlobalAir</option>
                <option value="SkyPremium">SkyPremium</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="aircraftType">Aeronave</label>

              <select
                id="aircraftType"
                name="aircraftType"
                value={flightData.aircraftType}
                onChange={handleInputChange}
              >
                <option value="Boeing 737">Boeing 737</option>
                <option value="Airbus A320">Airbus A320</option>
                <option value="Embraer 190">Embraer 190</option>
                <option value="Boeing 787">Boeing 787</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="flightStatus">Estado operativo</label>

              <select
                id="flightStatus"
                name="flightStatus"
                value={flightData.flightStatus}
                onChange={handleInputChange}
              >
                <option value="programado">Programado</option>
                <option value="demorado">Demorado</option>
                <option value="en-vuelo">En vuelo</option>
                <option value="aterrizado">Aterrizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <span>02</span>

            <div>
              <h2>Ruta e itinerario</h2>

              <p>
                El número de vuelo se asigna automáticamente según la ruta y la
                salida.
              </p>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="origin">Origen</label>

              <select
                id="origin"
                name="origin"
                value={flightData.origin}
                onChange={handleInputChange}
                className={errors.origin ? styles.errorInput : ""}
              >
                <option value="">Seleccioná un origen</option>

                {cities
                  .filter((city) => city !== flightData.destination)
                  .map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>

              {errors.origin && (
                <span className={styles.errorText}>{errors.origin}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="destination">Destino</label>

              <select
                id="destination"
                name="destination"
                value={flightData.destination}
                onChange={handleInputChange}
                className={errors.destination ? styles.errorInput : ""}
              >
                <option value="">Seleccioná un destino</option>

                {cities
                  .filter((city) => city !== flightData.origin)
                  .map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>

              {errors.destination && (
                <span className={styles.errorText}>{errors.destination}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="categoryId">Categoría</label>

              <select
                id="categoryId"
                name="categoryId"
                value={flightData.categoryId}
                onChange={handleInputChange}
                className={errors.categoryId ? styles.errorInput : ""}
              >
                <option value="">Seleccioná una categoría</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <span className={styles.errorText}>{errors.categoryId}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="departureDate">Fecha de salida</label>

              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={flightData.departureDate}
                onChange={handleInputChange}
                min={today}
                className={errors.departureDate ? styles.errorInput : ""}
              />

              {errors.departureDate && (
                <span className={styles.errorText}>
                  {errors.departureDate}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="departureTime">Horario de salida</label>

              <input
                type="time"
                id="departureTime"
                name="departureTime"
                value={flightData.departureTime}
                onChange={handleInputChange}
                className={errors.departureTime ? styles.errorInput : ""}
              />

              {errors.departureTime && (
                <span className={styles.errorText}>
                  {errors.departureTime}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="flightNumber">Número de vuelo asignado</label>

              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={flightData.flightNumber}
                readOnly
                className={styles.readOnlyInput}
                placeholder="Se genera al completar ruta y salida"
              />

              {errors.flightNumber && (
                <span className={styles.errorText}>
                  {errors.flightNumber}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="arrivalDate">Fecha de llegada</label>

              <input
                type="date"
                id="arrivalDate"
                name="arrivalDate"
                value={flightData.arrivalDate}
                onChange={handleInputChange}
                min={flightData.departureDate || today}
                className={errors.arrivalDate ? styles.errorInput : ""}
              />

              {errors.arrivalDate && (
                <span className={styles.errorText}>{errors.arrivalDate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="arrivalTime">Horario de llegada</label>

              <input
                type="time"
                id="arrivalTime"
                name="arrivalTime"
                value={flightData.arrivalTime}
                onChange={handleInputChange}
                className={errors.arrivalTime ? styles.errorInput : ""}
              />

              {errors.arrivalTime && (
                <span className={styles.errorText}>{errors.arrivalTime}</span>
              )}
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <span>03</span>

            <div>
              <h2>Capacidad y tarifa</h2>

              <p>
                La disponibilidad futura se calculará automáticamente a partir
                de las reservas confirmadas.
              </p>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="economySeats">Capacidad económica</label>

              <input
                type="number"
                min="0"
                id="economySeats"
                name="economySeats"
                value={flightData.economySeats}
                onChange={handleInputChange}
                className={errors.economySeats ? styles.errorInput : ""}
              />

              {errors.economySeats && (
                <span className={styles.errorText}>
                  {errors.economySeats}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="businessSeats">Capacidad ejecutiva</label>

              <input
                type="number"
                min="0"
                id="businessSeats"
                name="businessSeats"
                value={flightData.businessSeats}
                onChange={handleInputChange}
                className={errors.businessSeats ? styles.errorInput : ""}
              />

              {errors.businessSeats && (
                <span className={styles.errorText}>
                  {errors.businessSeats}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="firstSeats">Capacidad primera clase</label>

              <input
                type="number"
                min="0"
                id="firstSeats"
                name="firstSeats"
                value={flightData.firstSeats}
                onChange={handleInputChange}
                className={errors.firstSeats ? styles.errorInput : ""}
              />

              {errors.firstSeats && (
                <span className={styles.errorText}>
                  {errors.firstSeats}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Tarifa base</label>

              <input
                type="number"
                min="1"
                id="price"
                name="price"
                value={flightData.price}
                onChange={handleInputChange}
                className={errors.price ? styles.errorInput : ""}
                placeholder="Ej. 150000"
              />

              {errors.price && (
                <span className={styles.errorText}>{errors.price}</span>
              )}
            </div>
          </div>

          <div className={styles.capacitySummary}>
            <span>Capacidad total calculada</span>
            <strong>{totalCapacity} asientos</strong>
          </div>

          {errors.capacity && (
            <span className={styles.errorText}>{errors.capacity}</span>
          )}

          <div className={styles.availabilityNotice}>
            <strong>Disponibilidad automática:</strong> al guardar un vuelo en
            estado “Programado”, su fecha y horario estarán disponibles para los
            usuarios en el calendario de reservas.
          </div>
        </section>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/admin/listar-vuelos")}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEditMode
                ? "Guardar cambios"
                : "Programar vuelo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFlightPage;