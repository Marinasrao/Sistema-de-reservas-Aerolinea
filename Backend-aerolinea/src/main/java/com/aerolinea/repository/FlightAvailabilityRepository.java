package com.aerolinea.repository;

import com.aerolinea.entity.FlightAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FlightAvailabilityRepository extends JpaRepository<FlightAvailability, Long> {

    List<FlightAvailability> findByOriginAndDestinationAndDateBetween(
            String origin,
            String destination,
            LocalDate from,
            LocalDate to
    );

    boolean existsByOriginAndDestinationAndDate(
            String origin,
            String destination,
            LocalDate date
    );
}