import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AddFlightPage.module.css';
import { createFlight, updateFlight, getFlightById } from '../services/api';

const flightNumberRegex = /^(?:\d{3,10}|[A-Za-z]{2,3}\d{3,5}|[A-Za-z]{2,3}-[A-Za-z]{3}-[A-Za-z]{3}-\d{4})$/;

function normalizeDashes(s) {
  return (s || '').replace(/[\u2013\u2014]/g, '-').toUpperCase().trim();
}

function toTimeHHmm(s) {
  if (!s) return '';
  const clean = String(s).replace(/\s/g, '');
  const m = clean.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : clean;
}

function generateFlightNumber(origin, destination, departureTime, airline = "AeroLinea") {
  if (!origin || !destination || !departureTime) return "";

  const originCode = origin.substring(0, 3).toUpperCase();
  const destCode = destination.substring(0, 3).toUpperCase();
  const timeCode = departureTime.replace(":", "");

  let airlineCode = "AL";
  if (airline === "SkyWings") airlineCode = "SW";
  if (airline === "GlobalAir") airlineCode = "GA";

  return `${airlineCode}-${originCode}-${destCode}-${timeCode}`;
}


const AddFlightPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [flightData, setFlightData] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    price: '',
    seatsAvailable: '',
    airline: 'AeroLinea',
    aircraftType: '',
    flightStatus: 'programado',
    categoryId: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  

  useEffect(() => {
    fetch ("http://localhost:8080/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error al cargar categorías:", err));
  }, []);

useEffect(() => {
  if (id) {
    getFlightById(id)
      .then((data) => {
        setFlightData({
          ...data,
          flightNumber: normalizeDashes(data.flightNumber),
          departureTime: toTimeHHmm(data.departureTime),
          arrivalTime: toTimeHHmm(data.arrivalTime),
          departureDate: data.departureDate || '',
          arrivalDate: data.arrivalDate || '',
          categoryId: data.category ? data.category.id : '',
          userEditedNumber: true
        });
      })
      .catch((err) => {
        console.error('Error al obtener vuelo:', err);
        alert('No se pudo cargar el vuelo para edición');
      });
  }
}, [id]);


useEffect(() => {
  const { origin, destination, departureTime, airline } = flightData;

  const autoNumber = generateFlightNumber(origin, destination, departureTime, airline);

  if (!flightData.userEditedNumber) {
    setFlightData(prev => ({
      ...prev,
      flightNumber: autoNumber
    }));
  }
}, [
  flightData.origin,
  flightData.destination,
  flightData.departureTime,
  flightData.airline
]);


  const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === 'flightNumber') {
    const v = normalizeDashes(value);
    setFlightData((prev) => ({
      ...prev,
      flightNumber: v,
      userEditedNumber: true
    }));
  } else if (name === 'departureTime' || name === 'arrivalTime') {
    const v = toTimeHHmm(value);
    setFlightData((prev) => ({ ...prev, [name]: v }));
  } else {
    setFlightData((prev) => ({ ...prev, [name]: value }));
  }

  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: null }));
  }
};


  const validateForm = () => {
    const newErrors = {};

    if (!flightNumberRegex.test((flightData.flightNumber || '').trim())) {
      newErrors.flightNumber = 'Formatos válidos: 655500, AR1234 o AR-BUE-COR-0830';
    }

    if (!flightData.origin || flightData.origin.trim() === '') {
      newErrors.origin = 'El origen es obligatorio.';
    }

    if (!flightData.destination || flightData.destination.trim() === '') {
      newErrors.destination = 'El destino es obligatorio.';
    }

    if (
      flightData.departureDate &&
      flightData.departureTime &&
      flightData.arrivalDate &&
      flightData.arrivalTime
    ) {
      const dep = new Date(
        `${flightData.departureDate}T${toTimeHHmm(flightData.departureTime)}`
      );
      const arr = new Date(
        `${flightData.arrivalDate}T${toTimeHHmm(flightData.arrivalTime)}`
      );
      if (!(arr > dep)) {
        newErrors.arrivalDate = 'La llegada debe ser después de la salida';
      }
    }

    if (Number(flightData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (Number(flightData.seatsAvailable) <= 0) {
      newErrors.seatsAvailable = 'Debe haber al menos 1 asiento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...flightData,
        flightNumber: normalizeDashes(flightData.flightNumber),
        departureTime: toTimeHHmm(flightData.departureTime),
        arrivalTime: toTimeHHmm(flightData.arrivalTime),
        category: flightData.categoryId ? { id: flightData.categoryId } : null
      };


      if (isEditMode) {
        await updateFlight(id, payload);
        alert('Vuelo actualizado correctamente');
      } else {
        await createFlight(payload);
        alert('Vuelo agregado correctamente');
      }

      navigate('/admin/listar-vuelos');
    } catch (error) {
      console.error('Error:', error);

      if (error.message && error.message.includes('Ya existe un vuelo')) {
        setErrors({ global: 'Este vuelo ya se encuentra agendado en tu lista.' });
      } else {
        setErrors({ global: 'Ocurrió un error inesperado al guardar el vuelo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isEditMode ? 'Editar Vuelo' : 'Agregar Nuevo Vuelo'}
      </h1>

      {errors.global && (
        <div
          style={{
            background: '#fdecea',
            color: '#b00020',
            border: '1px solid #f5c2c0',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontWeight: 'bold',
          }}
        >
          🚫 {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="flightNumber">Número de Vuelo</label>
            <input
              type="text"
              id="flightNumber"
              name="flightNumber"
              value={flightData.flightNumber}
              onChange={handleInputChange}
              required
              pattern="(?:\d{3,10}|[A-Za-z]{2,3}\d{3,5}|[A-Za-z]{2,3}-[A-Za-z]{3}-[A-Za-z]{3}-\d{4})"
              title="Formatos válidos: 655500, AR1234 o AR-BUE-COR-0830"
              className={errors.flightNumber ? styles.errorInput : ''}
            />
            {errors.flightNumber && (
              <span className={styles.errorText}>{errors.flightNumber}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="airline">Aerolínea</label>
            <select
              id="airline"
              name="airline"
              value={flightData.airline}
              onChange={handleInputChange}
              required
            >
              <option value="AeroLinea">AeroLinea</option>
              <option value="SkyWings">SkyWings</option>
              <option value="GlobalAir">GlobalAir</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryId">Categoría</label>
            <select
              id="categoryId"
              name="categoryId"
              value={flightData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

        </div>



        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="origin">Origen</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={flightData.origin}
              onChange={handleInputChange}
              required
            />
            {errors.origin && (
              <span className={styles.errorText}>{errors.origin}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="destination">Destino</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={flightData.destination}
              onChange={handleInputChange}
              required
            />
            {errors.destination && (
              <span className={styles.errorText}>{errors.destination}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="departureDate">Fecha de Salida</label>
            <input
              type="date"
              id="departureDate"
              name="departureDate"
              value={flightData.departureDate}
              onChange={handleInputChange}
              min={today}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="departureTime">Hora de Salida</label>
            <input
              type="time"
              id="departureTime"
              name="departureTime"
              value={flightData.departureTime}
              onChange={handleInputChange}
              step="60"
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="arrivalDate">Fecha de Llegada</label>
            <input
              type="date"
              id="arrivalDate"
              name="arrivalDate"
              value={flightData.arrivalDate}
              onChange={handleInputChange}
              min={flightData.departureDate || today}
              required
              className={errors.arrivalDate ? styles.errorInput : ''}
            />
            {errors.arrivalDate && (
              <span className={styles.errorText}>{errors.arrivalDate}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="arrivalTime">Hora de Llegada</label>
            <input
              type="time"
              id="arrivalTime"
              name="arrivalTime"
              value={flightData.arrivalTime}
              onChange={handleInputChange}
              step="60"
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              name="price"
              value={flightData.price}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              required
              className={errors.price ? styles.errorInput : ''}
            />
            {errors.price && (
              <span className={styles.errorText}>{errors.price}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seatsAvailable">Asientos Disponibles</label>
            <input
              type="number"
              id="seatsAvailable"
              name="seatsAvailable"
              value={flightData.seatsAvailable}
              onChange={handleInputChange}
              min="1"
              required
              className={errors.seatsAvailable ? styles.errorInput : ''}
            />
            {errors.seatsAvailable && (
              <span className={styles.errorText}>
                {errors.seatsAvailable}
              </span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="aircraftType">Tipo de Aeronave</label>
            <input
              type="text"
              id="aircraftType"
              name="aircraftType"
              value={flightData.aircraftType}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="flightStatus">Estado del Vuelo</label>
            <select
              id="flightStatus"
              name="flightStatus"
              value={flightData.flightStatus}
              onChange={handleInputChange}
            >
              <option value="programado">Programado</option>
              <option value="en-vuelo">En vuelo</option>
              <option value="aterrizado">Aterrizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate('/admin/listar-vuelos')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Vuelo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFlightPage;
