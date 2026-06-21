package com.aerolinea.controller;

import com.aerolinea.entity.Flight;
import com.aerolinea.repository.FlightRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173")
public class FlightAvailabilityController {

    private final FlightRepository flightRepository;

    public FlightAvailabilityController(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAvailability(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String fromDate,
            @RequestParam String toDate
    ) {
        try {
            LocalDate from = LocalDate.parse(fromDate);
            LocalDate to = LocalDate.parse(toDate);

            List<Flight> flights = flightRepository
                    .findReservableFlightsByRouteAndDateRange(
                            origin,
                            destination,
                            from,
                            to
                    );

            Set<LocalDate> availableDates = flights.stream()
                    .map(Flight::getDepartureDate)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(TreeSet::new));

            List<Map<String, Object>> result = availableDates.stream()
                    .map(date -> {
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("date", date.toString());
                        item.put("available", true);
                        item.put("hasFlights", true);
                        return item;
                    })
                    .toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "No se pudo obtener la disponibilidad")
            );
        }
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date
    ) {
        try {
            LocalDate selectedDate = LocalDate.parse(date);

            List<Flight> flights = flightRepository
                    .findReservableFlightsByRouteAndDate(
                            origin,
                            destination,
                            selectedDate
                    );

            List<Map<String, Object>> slots = flights.stream()
                    .map(flight -> {
                        Map<String, Object> slot = new LinkedHashMap<>();

                        slot.put("id", flight.getId());
                        slot.put(
                                "departureTime",
                                flight.getDepartureTime() != null
                                        ? flight.getDepartureTime().toString()
                                        : ""
                        );
                        slot.put(
                                "arrivalTime",
                                flight.getArrivalTime() != null
                                        ? flight.getArrivalTime().toString()
                                        : ""
                        );
                        slot.put("airline", flight.getAirline());
                        slot.put("flightNumber", flight.getFlightNumber());
                        slot.put("price", flight.getPrice());

                        return slot;
                    })
                    .toList();

            return ResponseEntity.ok(slots);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "No se pudieron obtener los horarios disponibles")
            );
        }
    }
}