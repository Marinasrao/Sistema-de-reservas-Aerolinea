package com.aerolinea.controller;

import com.aerolinea.entity.FlightAvailability;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.repository.FlightAvailabilityRepository;
import com.aerolinea.repository.RecommendationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173")
public class FlightAvailabilityController {

    private final FlightAvailabilityRepository repository;
    private final RecommendationRepository recommendationRepository;

    public FlightAvailabilityController(
            FlightAvailabilityRepository repository,
            RecommendationRepository recommendationRepository
    ) {
        this.repository = repository;
        this.recommendationRepository = recommendationRepository;
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

            List<FlightAvailability> data =
                    repository.findByOriginAndDestinationAndDateBetween(
                            origin,
                            destination,
                            from,
                            to
                    );

            List<Map<String, Object>> result = data.stream().map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", item.getDate().toString());
                map.put("available", item.isAvailable());
                map.put("hasFlights", item.isAvailable());
                return map;
            }).toList();

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

            List<FlightAvailability> data =
                    repository.findByOriginAndDestinationAndDateBetween(
                            origin,
                            destination,
                            selectedDate,
                            selectedDate
                    );

            Optional<FlightAvailability> availability = data.stream().findFirst();

            if (availability.isEmpty() || !availability.get().isAvailable()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<Map<String, Object>> slots = new ArrayList<>();

            slots.add(createSlot("08:30", "Aerolinea"));
            slots.add(createSlot("19:15", "Aerolinea"));
            slots.add(createSlot("10:45", "SkiWings"));
            slots.add(createSlot("21:00", "SkyPremium"));

            return ResponseEntity.ok(slots);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "No se pudieron obtener los horarios disponibles")
            );
        }
    }

    @GetMapping("/generate")
    public ResponseEntity<?> generateAvailability(
            @RequestParam(defaultValue = "2026-05-01") String startDate,
            @RequestParam(defaultValue = "3") int months
    ) {
        try {
            String baseOrigin = "Buenos Aires";

            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = start.plusMonths(months);

            Set<String> destinations = recommendationRepository.findAll()
                    .stream()
                    .map(Recommendation::getDestination)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(destination -> !destination.isBlank())
                    .filter(destination -> !destination.equalsIgnoreCase(baseOrigin))
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            int created = 0;

            for (String destination : destinations) {
                created += generateRoute(baseOrigin, destination, start, end);
                created += generateRoute(destination, baseOrigin, start, end);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Disponibilidad generada correctamente");
            response.put("destinations", destinations.size());
            response.put("recordsCreated", created);
            response.put("startDate", start.toString());
            response.put("endDate", end.toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "No se pudo generar la disponibilidad")
            );
        }
    }

    private int generateRoute(
            String origin,
            String destination,
            LocalDate start,
            LocalDate end
    ) {
        LocalDate date = start;
        int counter = 0;
        int created = 0;

        while (!date.isAfter(end)) {
            boolean available = counter % 3 != 2;

            if (!repository.existsByOriginAndDestinationAndDate(origin, destination, date)) {
                FlightAvailability availability = new FlightAvailability();
                availability.setDate(date);
                availability.setOrigin(origin);
                availability.setDestination(destination);
                availability.setAvailable(available);

                repository.save(availability);
                created++;
            }

            counter++;
            date = date.plusDays(1);
        }

        return created;
    }

    private Map<String, Object> createSlot(String departureTime, String airline) {
        Map<String, Object> slot = new HashMap<>();
        slot.put("departureTime", departureTime);
        slot.put("airline", airline);
        return slot;
    }
}