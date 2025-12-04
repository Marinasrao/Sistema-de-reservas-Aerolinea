
package com.aerolinea.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class FlightDTO {
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
    private String airline;
    private String aircraftType;
    private String flightStatus;
}
