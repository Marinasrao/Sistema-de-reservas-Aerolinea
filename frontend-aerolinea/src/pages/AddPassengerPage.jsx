import React, { useEffect, useState } from "react";
import styles from "./AddPassengerPage.module.css";
import { createPassenger, getAvailableSeats } from "../services/api";

const AddPassengerPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    email: "",
    origin: "",
    destination: "",
    departureDate: "",
    flightId: "",
    flightClass: "ECONOMY",
    seatNumber: "",
  });

  const [filteredFlights, setFilteredFlights] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
      };

      if (
        name === "origin" ||
        name === "destination" ||
        name === "departureDate"
      ) {
        updatedForm.flightId = "";
        updatedForm.seatNumber = "";
      }

      if (name === "flightId" || name === "flightClass") {
        updatedForm.seatNumber = "";
      }

      return updatedForm;
    });

    if (
      name === "origin" ||
      name === "destination" ||
      name === "departureDate"
    ) {
      setFilteredFlights([]);
      setAvailableSeats([]);
    }

    if (name === "flightId" || name === "flightClass") {
      setAvailableSeats([]);
    }
  };

  const searchFlights = async () => {
    if (!form.origin || !form.destination || !form.departureDate) {
      setMessage("⚠️ Complete origen, destino y fecha.");
      return;
    }

    if (form.origin === form.destination) {
      setMessage("⚠️ El origen y el destino deben ser diferentes.");
      setFilteredFlights([]);
      return;
    }

    try {
      setMessage("");

      const params = new URLSearchParams({
        origin: form.origin,
        destination: form.destination,
        fromDate: form.departureDate,
      });

      const res = await fetch(
        `http://localhost:8080/api/flights/search?${params.toString()}`,
      );

      if (!res.ok) {
        throw new Error(`Error al buscar vuelos: ${res.status}`);
      }

      const data = await res.json();

      const flights = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      setFilteredFlights(flights);

      if (flights.length === 0) {
        setMessage(
          "⚠️ No se encontraron vuelos para esa ruta y fecha. Probá otra fecha o una ruta con vuelos cargados.",
        );
      }
    } catch (err) {
      console.error("Error al buscar vuelos:", err);
      setFilteredFlights([]);
      setMessage("❌ Error al buscar vuelos.");
    }
  };

  useEffect(() => {
    const fetchSeats = async () => {
      if (!form.flightId || !form.flightClass) {
        setAvailableSeats([]);
        return;
      }

      try {
        const seats = await getAvailableSeats(
          Number(form.flightId),
          form.flightClass,
        );

        setAvailableSeats(seats || []);
      } catch (err) {
        console.error("Error al obtener asientos:", err);
        setAvailableSeats([]);
      }
    };

    fetchSeats();
  }, [form.flightId, form.flightClass]);

  const assignSeat = () => {
    if (availableSeats.length > 0) {
      setForm((prev) => ({
        ...prev,
        seatNumber: availableSeats[0],
      }));

      setMessage("");
    } else {
      setMessage("❌ No hay asientos disponibles en esta clase.");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    }

    if (!form.documentNumber.trim()) {
      newErrors.documentNumber = "El DNI es obligatorio.";
    } else if (!/^\d{7,10}$/.test(form.documentNumber)) {
      newErrors.documentNumber =
        "El DNI debe contener solo números (7 a 10 dígitos).";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Formato de correo inválido.";
    }

    if (!form.origin) {
      newErrors.origin = "Debe seleccionar un origen.";
    }

    if (!form.destination) {
      newErrors.destination = "Debe seleccionar un destino.";
    }

    if (form.origin && form.destination && form.origin === form.destination) {
      newErrors.destination = "El destino debe ser diferente del origen.";
    }

    if (!form.departureDate) {
      newErrors.departureDate = "Debe seleccionar una fecha.";
    }

    if (!form.flightId) {
      newErrors.flightId = "Debe seleccionar un vuelo.";
    }

    if (!form.flightClass) {
      newErrors.flightClass = "Debe seleccionar una clase.";
    }

    if (!form.seatNumber) {
      newErrors.seatNumber = "Debe seleccionar o asignar un asiento.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/cities");

        if (!res.ok) {
          throw new Error(`Error al cargar ciudades: ${res.status}`);
        }

        const data = await res.json();

        const cityNames = (Array.isArray(data) ? data : [])
          .filter((city) => city?.active !== false)
          .map((city) => city?.name)
          .filter(Boolean)
          .map((city) => city.trim())
          .filter((city) => city.length > 0);

        setCities(
          [...new Set(cityNames)].sort((a, b) => a.localeCompare(b, "es")),
        );
      } catch (err) {
        console.error("Error cargando ciudades:", err);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await createPassenger(form);

      setMessage("✅ Pasajero creado correctamente.");

      setForm({
        firstName: "",
        lastName: "",
        documentNumber: "",
        email: "",
        origin: "",
        destination: "",
        departureDate: "",
        flightId: "",
        flightClass: "ECONOMY",
        seatNumber: "",
      });

      setErrors({});
      setFilteredFlights([]);
      setAvailableSeats([]);
    } catch (err) {
      console.error("Error al crear pasajero:", err);

      const backendMessage =
        err?.message ||
        "Error al crear pasajero. Verificá el vuelo y el asiento seleccionado.";

      setMessage(`❌ ${backendMessage}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Cargar Pasajero</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={form.firstName}
          onChange={handleChange}
        />

        {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}

        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={form.lastName}
          onChange={handleChange}
        />

        {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}

        <input
          type="text"
          name="documentNumber"
          placeholder="DNI"
          value={form.documentNumber}
          onChange={handleChange}
        />

        {errors.documentNumber && (
          <p className={styles.error}>{errors.documentNumber}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
        />

        {errors.email && <p className={styles.error}>{errors.email}</p>}

        <select name="origin" value={form.origin} onChange={handleChange}>
          <option value="">Seleccionar origen</option>

          {cities.map((city) => (
            <option key={`origin-${city}`} value={city}>
              {city}
            </option>
          ))}
        </select>

        {errors.origin && <p className={styles.error}>{errors.origin}</p>}

        <select
          name="destination"
          value={form.destination}
          onChange={handleChange}
        >
          <option value="">Seleccionar destino</option>

          {cities
            .filter((city) => city !== form.origin)
            .map((city) => (
              <option key={`destination-${city}`} value={city}>
                {city}
              </option>
            ))}
        </select>

        {errors.destination && (
          <p className={styles.error}>{errors.destination}</p>
        )}

        <input
          type="date"
          name="departureDate"
          value={form.departureDate}
          onChange={handleChange}
        />

        {errors.departureDate && (
          <p className={styles.error}>{errors.departureDate}</p>
        )}

        <button type="button" onClick={searchFlights}>
          Buscar vuelos
        </button>

        <select name="flightId" value={form.flightId} onChange={handleChange}>
          <option value="">Seleccionar vuelo</option>

          {filteredFlights.map((flight) => (
            <option key={flight.id} value={flight.id}>
              {flight.flightNumber} - {flight.departureTime}
            </option>
          ))}
        </select>

        {errors.flightId && <p className={styles.error}>{errors.flightId}</p>}

        <select
          name="flightClass"
          value={form.flightClass}
          onChange={handleChange}
        >
          <option value="ECONOMY">ECONOMY</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="FIRST">FIRST</option>
        </select>

        {errors.flightClass && (
          <p className={styles.error}>{errors.flightClass}</p>
        )}

        <div className={styles.seatAssignRow}>
          <select
            name="seatNumber"
            value={form.seatNumber}
            onChange={handleChange}
            disabled={!form.flightId}
          >
            <option value="">Seleccionar asiento</option>

            {availableSeats.map((seat) => (
              <option key={seat} value={seat}>
                {seat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={assignSeat}
            disabled={!form.flightId || availableSeats.length === 0}
          >
            Asignar automáticamente
          </button>
        </div>

        {errors.seatNumber && (
          <p className={styles.error}>{errors.seatNumber}</p>
        )}

        <button type="submit">Guardar pasajero</button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddPassengerPage;
