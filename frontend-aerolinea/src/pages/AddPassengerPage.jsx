import React, { useState, useEffect } from 'react';
import styles from './AddPassengerPage.module.css';
import {
  createPassenger,
  getAvailableSeats,
} from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddPassengerPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    email: '',
    origin: '',
    destination: '',
    departureDate: '',
    flightId: '',
    flightClass: 'ECONOMY',
    seatNumber: ''
  });

  const [filteredFlights, setFilteredFlights] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);


  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchFlights = async () => {
    if (!form.origin || !form.destination || !form.departureDate) {
      setMessage("⚠️ Complete origen, destino y fecha.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/flights/search?origin=${form.origin}&destination=${form.destination}&fromDate=${form.departureDate}`

      );

      const data = await res.json();
      setFilteredFlights(Array.isArray(data) ? data : data.content || []);
      setMessage('');
    } catch (err) {
      console.error(err);
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
        const seats = await getAvailableSeats(parseInt(form.flightId), form.flightClass);
        setAvailableSeats(seats || []);
      } catch (err) {
        console.error('Error al obtener asientos', err);
        setAvailableSeats([]);
      }
    };

    fetchSeats();
  }, [form.flightId, form.flightClass]);

  const assignSeat = () => {
    if (availableSeats.length > 0) {
      setForm(prev => ({ ...prev, seatNumber: availableSeats[0] }));
    } else {
      setMessage('❌ No hay asientos disponibles en esta clase.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "El nombre es obligatorio.";
    if (!form.lastName.trim()) newErrors.lastName = "El apellido es obligatorio.";

    if (!form.documentNumber.trim()) {
      newErrors.documentNumber = "El DNI es obligatorio.";
    } else if (!/^\d{7,10}$/.test(form.documentNumber)) {
      newErrors.documentNumber = "El DNI debe contener solo números (7 a 10 dígitos).";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Formato de correo inválido.";
    }

    if (!form.flightId) newErrors.flightId = "Debe seleccionar un vuelo.";
    if (!form.flightClass) newErrors.flightClass = "Debe seleccionar una clase.";
    if (!form.seatNumber) newErrors.seatNumber = "Debe seleccionar o asignar un asiento.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/flights/search/cities");
        const data = await res.json();
        setCities(data || []);
      } catch (err) {
        console.error("Error cargando ciudades", err);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');




    if (!validateForm()) return;

    try {
      await createPassenger(form);

      setMessage('✅ Pasajero creado correctamente');

      setForm({
        firstName: '',
        lastName: '',
        documentNumber: '',
        email: '',
        origin: '',
        destination: '',
        departureDate: '',
        flightId: '',
        flightClass: 'ECONOMY',
        seatNumber: ''
      });

      setFilteredFlights([]);
      setAvailableSeats([]);
     

    } catch (err) {
      console.error('Error al crear pasajero', err);
      setMessage('❌ Error al crear pasajero');
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
        {errors.documentNumber && <p className={styles.error}>{errors.documentNumber}</p>}

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        {/* BÚSQUEDA DE VUELOS */}

        <select name="origin" value={form.origin} onChange={handleChange}>
          <option value="">Seleccionar origen</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select name="destination" value={form.destination} onChange={handleChange}>
          <option value="">Seleccionar destino</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="departureDate"
          value={form.departureDate}
          onChange={handleChange}
        />

        <button type="button" onClick={searchFlights}>
          Buscar vuelos
        </button>

        {/* VUELOS FILTRADOS */}
<select
  name="flightId"
  value={form.flightId}
  onChange={(e) => {
    
        handleChange(e);
  }}
>
  <option value="">Seleccionar vuelo</option>

  {Array.isArray(filteredFlights) &&
    filteredFlights.map((flight) => {
      
      return (
        <option key={flight.id} value={flight.id}>
          {flight.flightNumber} - {flight.departureTime}
        </option>
      );
    })}
</select>

{errors.flightId && <p className={styles.error}>{errors.flightId}</p>}
        
        {/* CLASE */}

        <select name="flightClass" value={form.flightClass} onChange={handleChange}>
          <option value="ECONOMY">ECONOMY</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="FIRST">FIRST</option>
        </select>
        {errors.flightClass && <p className={styles.error}>{errors.flightClass}</p>}

        {/* ASIENTOS */}

        <div className={styles.seatAssignRow}>
          <select
            name="seatNumber"
            value={form.seatNumber}
            onChange={handleChange}
          >
            <option value="">Seleccionar asiento</option>
            {availableSeats.map(seat => (
              <option key={seat} value={seat}>
                {seat}
              </option>
            ))}
          </select>

          <button type="button" onClick={assignSeat}>
            Asignar automáticamente
          </button>
        </div>
        {errors.seatNumber && <p className={styles.error}>{errors.seatNumber}</p>}

        <button type="submit">Guardar pasajero</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddPassengerPage;
