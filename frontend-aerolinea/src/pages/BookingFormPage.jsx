import React, { useState } from 'react';
import styles from './BookingFormPage.module.css';

const BookingFormPage = () => {
    const [booking, setBooking] = useState({
        flightNumber: '',
        passenger: {
            firstName: '',
            lastName: '',
            dni: '',
            passport: '',
            email: ''
        },
        travelDate: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name in booking.passenger) {
            setBooking({
                ...booking,
                passenger: {
                    ...booking.passenger,
                    [name]: value
                }
            });
        } else {
            setBooking({
                ...booking,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:8080/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });

            if (res.ok) {
                setMessage('✅ Reserva realizada con éxito');
                setBooking({
                    flightNumber: '',
                    passenger: {
                        firstName: '',
                        lastName: '',
                        dni: '',
                        passport: '',
                        email: ''
                    },
                    travelDate: ''
                });
            } else {
                setMessage('❌ Error al realizar la reserva');
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error de conexión con el servidor');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Formulario de Reserva</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>Número de Vuelo:</label>
                <input
                    type="text"
                    name="flightNumber"
                    value={booking.flightNumber}
                    onChange={handleChange}
                    required
                />

                <label>Fecha del Viaje:</label>
                <input
                    type="date"
                    name="travelDate"
                    value={booking.travelDate}
                    onChange={handleChange}
                    required
                />

                <h3>Datos del Pasajero</h3>

                <label>Nombre:</label>
                <input
                    type="text"
                    name="firstName"
                    value={booking.passenger.firstName}
                    onChange={handleChange}
                    required
                />

                <label>Apellido:</label>
                <input
                    type="text"
                    name="lastName"
                    value={booking.passenger.lastName}
                    onChange={handleChange}
                    required
                />

                <label>DNI:</label>
                <input
                    type="text"
                    name="dni"
                    value={booking.passenger.dni}
                    onChange={handleChange}
                    required
                />

                <label>Pasaporte:</label>
                <input
                    type="text"
                    name="passport"
                    value={booking.passenger.passport}
                    onChange={handleChange}
                />

                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={booking.passenger.email}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Reservar</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
};

export default BookingFormPage;
