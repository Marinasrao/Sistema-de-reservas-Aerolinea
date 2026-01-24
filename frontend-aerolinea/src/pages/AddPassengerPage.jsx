import React, { useState, useEffect } from 'react';
import styles from './AddPassengerPage.module.css';
import {
  createPassenger,
  getAllFlights,
  getAvailableSeats,
} from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddPassengerPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    email: '',
    flightId: '',
    flightClass: 'ECONOMY',
    seatNumber: ''
  });

  const [flights, setFlights] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await getAllFlights();
        setFlights(data);
      } catch (err) {
        console.error('Error al cargar vuelos', err);
      }
    };
    fetchFlights();
  }, []);

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

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  if (!form.seatNumber) {
    newErrors.seatNumber = "Debe seleccionar o asignar un asiento.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;

    if (!form.seatNumber) {
      setMessage('❌ Debe asignar un asiento antes de guardar.');
      return;
    }

    try {
      await createPassenger(form);
      setMessage('✅ Pasajero creado correctamente');
      setForm({
        firstName: '',
        lastName: '',
        documentNumber: '',
        email: '',
        flightId: '',
        flightClass: 'ECONOMY',
        seatNumber: ''
      });
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

        <select name="flightId" value={form.flightId} onChange={handleChange}>
          <option value="">Seleccionar vuelo</option>
          {flights.map(flight => (
            <option key={flight.id} value={flight.id}>
              {flight.flightNumber}
            </option>
          ))}
        </select>
        {errors.flightId && <p className={styles.error}>{errors.flightId}</p>}

        <select name="flightClass" value={form.flightClass} onChange={handleChange}>
          <option value="ECONOMY">ECONOMY</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="FIRST">FIRST</option>
        </select>
        {errors.flightClass && <p className={styles.error}>{errors.flightClass}</p>}



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
          {errors.seatNumber && <p className={styles.error}>{errors.seatNumber}</p>}

          <button type="button" onClick={assignSeat}>
            Asignar automáticamente
          </button>
        </div>


        <button type="submit">Guardar pasajero</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddPassengerPage;
