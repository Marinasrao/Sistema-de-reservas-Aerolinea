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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

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
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={form.lastName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="documentNumber"
          placeholder="DNI"
          value={form.documentNumber}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
        />

        <select name="flightId" value={form.flightId} onChange={handleChange}>
          <option value="">Seleccionar vuelo</option>
          {flights.map(flight => (
            <option key={flight.id} value={flight.id}>
              {flight.flightNumber}
            </option>
          ))}
        </select>

        <select name="flightClass" value={form.flightClass} onChange={handleChange}>
          <option value="ECONOMY">ECONOMY</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="FIRST">FIRST</option>
        </select>

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


        <button type="submit">Guardar pasajero</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddPassengerPage;
