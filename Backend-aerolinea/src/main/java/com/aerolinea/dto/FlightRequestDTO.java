package com.aerolinea.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class FlightRequestDTO {

    @NotBlank(message = "El número de vuelo es obligatorio.")
    @Pattern(
            regexp = "^[A-Za-z]{2}-[A-Za-z]{3}-[A-Za-z]{3}-\\d{4}$",
            message = "Formato inválido. Ej: AR-BUE-COR-0830"
    )
    private String flightNumber;

    @NotBlank(message = "El origen es obligatorio.")
    private String origin;

    @NotBlank(message = "El destino es obligatorio.")
    private String destination;

    @NotNull(message = "La fecha de salida es obligatoria.")
    private LocalDate departureDate;

    @NotNull(message = "El horario de salida es obligatorio.")
    private LocalTime departureTime;

    @NotNull(message = "La fecha de llegada es obligatoria.")
    private LocalDate arrivalDate;

    @NotNull(message = "El horario de llegada es obligatorio.")
    private LocalTime arrivalTime;

    @Min(value = 1, message = "El precio debe ser mayor a cero.")
    private double price;


    @Min(value = 0, message = "Los asientos disponibles no pueden ser negativos.")
    private int seatsAvailable;


    private int economySeats = 120;
    private int businessSeats = 20;
    private int firstSeats = 10;

    private String airline;
    private String aircraftType;
    private String flightStatus;

    private Long recommendationId;

    @NotNull(message = "La categoría es obligatoria.")
    private Long categoryId;

}
