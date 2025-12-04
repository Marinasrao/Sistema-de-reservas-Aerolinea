package com.aerolinea.controller;

import com.aerolinea.entity.Flight;
import com.aerolinea.repository.FlightRepository;
import com.aerolinea.service.FlightService;
import com.aerolinea.service.RecommendationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "http://localhost:5173")
public class FlightController {

    private static final Logger log = LoggerFactory.getLogger(FlightController.class);

    @Autowired
    private FlightService flightService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private FlightRepository flightRepository;

    /* ==================== HEALTH ==================== */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("flights-ok");
    }

    /* ==================== CRUD ==================== */

    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        return flightService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping({"", "/add"})
    public ResponseEntity<?> addFlight(@Valid @RequestBody Flight flight) {
        try {
            Flight saved = flightService.saveFlight(flight);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/add/{recommendationId}")
    public ResponseEntity<?> addFlightToRecommendation(@PathVariable Long recommendationId,
                                                       @RequestBody Flight flight) {
        var rec = recommendationService.findById(recommendationId);
        if (rec == null) return ResponseEntity.notFound().build();
        flight.setRecommendation(rec);
        try {
            Flight saved = flightService.saveFlight(flight);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping({"/{id}", "/edit/{id}"})
    public ResponseEntity<?> updateFlight(@PathVariable Long id, @Valid @RequestBody Flight flight) {
        try {
            Flight updated = flightService.updateFlight(id, flight);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFlight(@PathVariable Long id,
                                          @RequestParam(defaultValue = "false") boolean force) {
        try {
            flightService.deleteFlight(id, force);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException | EmptyResultDataAccessException e) {
            return ResponseEntity.status(404).body(Map.of("message", "Vuelo no encontrado: " + id));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of(
                    "message", e.getMessage(),
                    "hint", "Usá ?force=true para eliminar también los pasajeros vinculados."
            ));
        } catch (Exception e) {
            log.error("Error eliminando vuelo {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Error interno al eliminar el vuelo"));
        }
    }

    /* ==================== RELACIÓN CON RECOMMENDATION ==================== */

    @GetMapping("/recommendation/{recommendationId}")
    public ResponseEntity<List<Flight>> getFlightsByRecommendation(@PathVariable Long recommendationId) {
        return ResponseEntity.ok(flightService.getFlightsByRecommendation(recommendationId));
    }

    /* ==================== BÚSQUEDAS ==================== */

    @GetMapping("/search/by-destination")
    public ResponseEntity<List<Flight>> searchByDestination(@RequestParam String destination) {
        return ResponseEntity.ok(flightService.getFlightsByDestination(destination));
    }

    @GetMapping("/search/by-destination-and-month")
    public ResponseEntity<?> searchByDestinationAndMonth_List(
            @RequestParam String destination,
            @RequestParam String ym,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            var yearMonth = java.time.YearMonth.parse(ym);
            var start = yearMonth.atDay(1);
            var end = yearMonth.atEndOfMonth();

            var all = flightService.searchFlightsByDestinationAndDateRange(destination, start, end);
            all.sort(Comparator
                    .comparing(Flight::getDepartureDate, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(Flight::getDepartureTime, Comparator.nullsLast(Comparator.naturalOrder()))
            );

            int s = Math.min(Math.max(size, 1), 50);
            int p = Math.max(page, 0);
            int total = all.size();
            int from = p * s;
            int to = Math.min(from + s, total);
            var content = (from >= total) ? List.<Flight>of() : all.subList(from, to);
            int totalPages = (int) Math.ceil(total / (double) s);

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "page", p,
                    "size", s,
                    "totalPages", totalPages,
                    "totalElements", total,
                    "destination", destination,
                    "ym", ym
            ));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Parámetro ym inválido. Usá YYYY-MM (ej: 2025-08)",
                    "error", ex.getMessage()
            ));
        }
    }

    @GetMapping("/random")
    public ResponseEntity<List<Flight>> getRandom(@RequestParam(defaultValue = "10") int max) {
        return ResponseEntity.ok(flightService.getRandomFlights(Math.max(1, max)));
    }

    @PostMapping("/admin/backfill")
    public ResponseEntity<?> backfillFlights() {
        int created = flightService.backfillFlightsForAllRecommendations();
        return ResponseEntity.ok(Map.of("created", created));
    }

    @PostMapping("/admin/cleanup-autogen")
    public ResponseEntity<?> cleanupAutogen() {
        int deleted = flightService.deleteAutoGeneratedFlights();
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    @PostMapping("/admin/reseed")
    public ResponseEntity<?> reseed() {
        Map<String, Integer> result = flightService.reseedAutoFlights();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/delete-guard")
    public ResponseEntity<?> getDeleteGuard(@PathVariable Long id) {
        try {
            Map<String, Object> guard = flightService.deleteGuard(id);
            return ResponseEntity.ok(guard);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Guard delete error {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Error al evaluar eliminación"));
        }
    }

    @GetMapping("/destinations")
    public ResponseEntity<List<String>> getDistinctDestinations() {
        return ResponseEntity.ok(flightService.getDistinctDestinations());
    }

    @GetMapping("/search/fuzzy")
    public ResponseEntity<List<Flight>> searchFuzzy(@RequestParam String term) {
        return ResponseEntity.ok(flightService.searchFuzzy(term));
    }

    @GetMapping("/{id}/available-seats")
    public ResponseEntity<List<String>> getAvailableSeats(
            @PathVariable Long id,
            @RequestParam("flightClass") String flightClass) {
        return ResponseEntity.ok(flightService.getAvailableSeats(id, flightClass));
    }

    @PostMapping("/seed-auto")
    public Map<String, Integer> seedAutoFlights() {
        return flightService.reseedAutoFlights();
    }

    @GetMapping("/delete-old")
    public Map<String, Object> deleteOldFlights() {
        int deleted = flightService.deletePastFlights();
        return Map.of("deleted", deleted);
    }

    @GetMapping("/search")
    public List<Flight> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {
        return flightService.searchFlights(origin, destination, fromDate);
    }

    /* ==================== AUTOCOMPLETE DE CIUDADES ==================== */

    @GetMapping("/search/cities")
    public ResponseEntity<List<String>> getUniqueCities() {
        try {
            List<String> cities = flightRepository.findDistinctOriginsAndDestinations();
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            log.error("Error obteniendo ciudades únicas", e);
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }
}
