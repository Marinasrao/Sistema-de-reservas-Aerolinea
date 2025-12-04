// src/main/java/com/aerolinea/entity/Booking.java
package com.aerolinea.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String flightNumber;

    private LocalDate departureDate;

    @ManyToOne
    @JoinColumn(name = "passenger_id")
    private Passenger passenger;
}
