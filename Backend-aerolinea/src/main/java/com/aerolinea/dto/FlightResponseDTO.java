package com.aerolinea.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class FlightResponseDTO {

    private Long id;
    private String flightNumber;
    private String origin;
    private String destination;

    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalDate arrivalDate;
    private LocalTime arrivalTime;

    private double price;

    private int seatsAvailable;
    private int economySeats;
    private int businessSeats;
    private int firstSeats;

    private String airline;
    private String aircraftType;
    private String flightStatus;

    private List<String> imageUrls;

    private Long recommendationId;

    // -------------------- NUEVO: CAMPOS DE CATEGORÍA --------------------
    private Long categoryId;
    private String categoryTitle;
    private String categoryImage;
    private String categoryPromoText;
}

