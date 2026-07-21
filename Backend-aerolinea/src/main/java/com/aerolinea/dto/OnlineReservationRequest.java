package com.aerolinea.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OnlineReservationRequest {

    private String reservationCode;
    private String origin;
    private String destination;
    private String departureDate;
    private String returnDate;
    private String flightClass;
    private BigDecimal totalPrice;

    @NotEmpty(message = "La reserva debe incluir al menos un pasajero.")
    @Valid
    private List<PassengerDto> passengers;
}