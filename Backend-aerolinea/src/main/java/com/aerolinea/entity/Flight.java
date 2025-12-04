package com.aerolinea.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Pattern(
            regexp = "^(\\d{3,10}|[A-Za-z]{2,3}\\d{3,5}|[A-Za-z]{2,3}-[A-Za-z]{3}-[A-Za-z]{3}-\\d{4})$",
            message = "Formato inválido. Ej: 655500, AR1234 o AR-BAI-COR-0830"
    )
    private String flightNumber;

    private String origin;
    private String destination;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate departureDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime departureTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate arrivalDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime arrivalTime;

    @Min(0)
    private double price;

    @Min(0)
    private int seatsAvailable;
    private int economySeats;
    private int businessSeats;
    private int firstSeats;

    private String airline;
    private String aircraftType;
    private String flightStatus;

    @ElementCollection
    private List<String> imageUrls;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id")
    @JsonIgnore
    private Recommendation recommendation;

    /* -------------------- Normalización automática -------------------- */
    @PrePersist
    @PreUpdate
    private void normalize() {
        if (flightNumber != null) flightNumber = flightNumber.toUpperCase(Locale.ROOT).trim();
        if (origin != null) origin = origin.trim();
        if (destination != null) destination = destination.trim();
        if (airline != null) airline = airline.trim();
        if (aircraftType != null) aircraftType = aircraftType.trim();
        if (flightStatus != null) flightStatus = flightStatus.trim();
        if (description != null) description = description.trim();
    }
}
