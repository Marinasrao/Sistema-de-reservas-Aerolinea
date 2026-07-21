package com.aerolinea.service;

import com.aerolinea.dto.OnlineReservationRequest;
import com.aerolinea.entity.Flight;
import com.aerolinea.entity.Passenger;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    @Override
    public void sendActivationEmail(String to, String activationLink) {
        String subject = "¡Bienvenida/o a FlightBooking! Activá tu cuenta ✈️";

        String text = String.format(
                "Hola!\n\n" +
                        "¡Gracias por registrarte en FlightBooking! ✈️\n\n" +
                        "Tu cuenta fue creada correctamente con el siguiente correo:\n" +
                        "- Email: %s\n\n" +
                        "Para activar tu cuenta y comenzar a usarla, hacé clic en el siguiente enlace:\n" +
                        "%s\n\n" +
                        "Si no realizaste este registro, podés ignorar este mensaje.\n\n" +
                        "¿No recibiste el correo de activación?\n" +
                        "Desde la aplicación podrás solicitar que se reenvíe.\n\n" +
                        "¡Buen viaje!\n" +
                        "Equipo FlightBooking ✈️",
                to,
                activationLink
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    @Override
    public void sendReservationConfirmationEmail(
            String to,
            OnlineReservationRequest request,
            List<Passenger> savedPassengers
    ) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException(
                    "No se puede enviar el correo de confirmación sin destinatario."
            );
        }

        Flight flight = savedPassengers != null && !savedPassengers.isEmpty()
                ? savedPassengers.get(0).getFlight()
                : null;

        String reservationCode = valueOrDefault(
                request.getReservationCode(),
                "FB-" + System.currentTimeMillis()
        );

        String origin = valueOrDefault(
                request.getOrigin(),
                flight != null ? flight.getOrigin() : "-"
        );

        String destination = valueOrDefault(
                request.getDestination(),
                flight != null ? flight.getDestination() : "-"
        );

        String departureDate = valueOrDefault(
                request.getDepartureDate(),
                flight != null && flight.getDepartureDate() != null
                        ? flight.getDepartureDate().toString()
                        : "-"
        );

        String returnDate = valueOrDefault(request.getReturnDate(), "-");

        String flightClass = valueOrDefault(
                request.getFlightClass(),
                savedPassengers != null && !savedPassengers.isEmpty()
                        ? savedPassengers.get(0).getFlightClass()
                        : "-"
        );

        String totalPrice = formatPrice(request.getTotalPrice());

        String subject = "Confirmación de reserva " + reservationCode + " - FlightBooking";

        StringBuilder text = new StringBuilder();

        text.append("¡Tu reserva fue confirmada! ✈️\n\n");
        text.append("Hola,\n\n");
        text.append("Te enviamos el detalle de tu reserva realizada en FlightBooking.\n\n");

        text.append("DATOS DE LA RESERVA\n");
        text.append("--------------------\n");
        text.append("Código de reserva: ").append(reservationCode).append("\n");
        text.append("Estado: Confirmada / Pagada\n");
        text.append("Canal: Online\n\n");

        text.append("DATOS DEL VUELO\n");
        text.append("--------------------\n");
        text.append("Ruta: ").append(origin).append(" → ").append(destination).append("\n");

        if (flight != null && flight.getFlightNumber() != null) {
            text.append("Número de vuelo: ").append(flight.getFlightNumber()).append("\n");
        }

        text.append("Fecha de ida: ").append(departureDate).append("\n");

        if (!returnDate.equals("-")) {
            text.append("Fecha de vuelta: ").append(returnDate).append("\n");
        }

        text.append("Clase: ").append(formatFlightClass(flightClass)).append("\n");

        if (flight != null && flight.getDepartureTime() != null) {
            text.append("Horario de salida: ").append(flight.getDepartureTime()).append("\n");
        }

        if (flight != null && flight.getArrivalTime() != null) {
            text.append("Horario de llegada: ").append(flight.getArrivalTime()).append("\n");
        }

        text.append("\nPASAJEROS Y ASIENTOS\n");
        text.append("--------------------\n");

        if (savedPassengers == null || savedPassengers.isEmpty()) {
            text.append("No se registraron pasajeros en el detalle.\n");
        } else {
            for (int i = 0; i < savedPassengers.size(); i++) {
                Passenger passenger = savedPassengers.get(i);

                text.append(i + 1)
                        .append(". ")
                        .append(valueOrDefault(passenger.getFirstName(), "-"))
                        .append(" ")
                        .append(valueOrDefault(passenger.getLastName(), "-"))
                        .append(" | Documento: ")
                        .append(valueOrDefault(passenger.getDocumentNumber(), "-"))
                        .append(" | Asiento: ")
                        .append(valueOrDefault(passenger.getSeatNumber(), "-"))
                        .append("\n");
            }
        }

        text.append("\nPAGO\n");
        text.append("--------------------\n");
        text.append("Total abonado: ").append(totalPrice).append("\n\n");

        text.append("IMPORTANTE\n");
        text.append("--------------------\n");
        text.append("Este correo confirma la operación realizada en FlightBooking. ");
        text.append("No contiene datos de tarjeta ni información sensible de pago.\n\n");

        text.append("Gracias por elegirnos.\n");
        text.append("Equipo FlightBooking ✈️");

        sendEmail(to, subject, text.toString());
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "-";
        }

        return "$" + price;
    }

    private String formatFlightClass(String flightClass) {
        if (flightClass == null) {
            return "-";
        }

        return switch (flightClass.toUpperCase()) {
            case "BUSINESS" -> "Ejecutiva";
            case "FIRST" -> "Primera";
            default -> "Económica";
        };
    }
}