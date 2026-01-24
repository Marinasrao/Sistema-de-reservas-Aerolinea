package com.aerolinea.controller;

import com.aerolinea.entity.Flight;
import com.aerolinea.mapper.FlightMapper;
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
import com.aerolinea.dto.FlightRequestDTO;
import com.aerolinea.dto.FlightResponseDTO;

import java.time.LocalDate;
import java.util.*;



    @RestController
    @RequestMapping("/api/flights")
    @CrossOrigin(origins = "http://localhost:5173")
    public class FlightController {

        private static final Logger log = LoggerFactory.getLogger(com.aerolinea.controller.FlightController.class);

        @Autowired
        private FlightService flightService;

        @Autowired
        private RecommendationService recommendationService;

        @Autowired
        private FlightRepository flightRepository;

        @Autowired
        private FlightMapper flightMapper;


        /* ==================== HEALTH ==================== */
        @GetMapping("/ping")
        public ResponseEntity<String> ping() {
            return ResponseEntity.ok("flights-ok");
        }

        /* ==================== CRUD ==================== */

        @GetMapping
        public ResponseEntity<List<?>> getAllFlights() {
            return ResponseEntity.ok(
                    flightService.getAllFlights()
                            .stream()
                            .map(flightMapper::toDTO)
                            .toList()
            );
        }


        @GetMapping("/{id}")
        public ResponseEntity<FlightResponseDTO> getFlightById(@PathVariable Long id) {
            return flightService.findById(id)
                    .map(flightMapper::toDTO)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }


        @PostMapping({"", "/add"})
        public ResponseEntity<FlightResponseDTO> addFlight(
                @Valid @RequestBody FlightRequestDTO dto) {

            Flight flight = flightMapper.toEntity(dto);
            Flight saved = flightService.saveFlight(flight);

            return ResponseEntity.ok(flightMapper.toDTO(saved));
        }


    @PostMapping("/add/{recommendationId}")
    public ResponseEntity<?> addFlightToRecommendation(
            @PathVariable Long recommendationId,
            @Valid @RequestBody FlightRequestDTO dto) {

        var rec = recommendationService.findById(recommendationId);
        if (rec == null) return ResponseEntity.notFound().build();

        try {
            Flight flight = flightMapper.toEntity(dto);
            flight.setRecommendation(rec);

            Flight saved = flightService.saveFlight(flight);
            return ResponseEntity.ok(flightMapper.toDTO(saved));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }



        @PutMapping({"/{id}", "/edit/{id}"})
        public ResponseEntity<FlightResponseDTO> updateFlight(
                @PathVariable Long id,
                @Valid @RequestBody FlightRequestDTO dto) {

            Flight flight = flightMapper.toEntity(dto);
            Flight updated = flightService.updateFlight(id, flight);

            return ResponseEntity.ok(flightMapper.toDTO(updated));
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
        public ResponseEntity<List<FlightResponseDTO>> getFlightsByRecommendation(
                @PathVariable Long recommendationId) {

            var flights = flightService.getFlightsByRecommendation(recommendationId)
                    .stream()
                    .map(flightMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(flights);
        }

        /* ==================== BÚSQUEDAS ==================== */

        @GetMapping("/search/by-destination")
        public ResponseEntity<List<FlightResponseDTO>> searchByDestination(@RequestParam String destination) {

            var flights = flightService.getFlightsByDestination(destination)
                    .stream()
                    .map(flightMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(flights);
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

                // Ordenar
                all.sort(
                        Comparator.comparing(Flight::getDepartureDate, Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(Flight::getDepartureTime, Comparator.nullsLast(Comparator.naturalOrder()))
                );

                // Paginación manual
                int s = Math.min(Math.max(size, 1), 50);
                int p = Math.max(page, 0);
                int total = all.size();

                int from = p * s;
                int to = Math.min(from + s, total);
                var content = (from >= total) ? List.<Flight>of() : all.subList(from, to);

                // Convertimos a DTOs
                var dtoContent = content
                        .stream()
                        .map(flightMapper::toDTO)
                        .toList();

                int totalPages = (int) Math.ceil(total / (double) s);

                // Respondemos SOLO DTOs
                return ResponseEntity.ok(Map.of(
                        "content", dtoContent,
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
        public ResponseEntity<List<FlightResponseDTO>> getRandom(
                @RequestParam(defaultValue = "10") int max) {

            var flights = flightService.getRandomFlights(max)
                    .stream()
                    .map(flightMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(flights);
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
        public ResponseEntity<List<FlightResponseDTO>> searchFuzzy(@RequestParam String term) {
            var flights = flightService.searchFuzzy(term)
                    .stream()
                    .map(flightMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(flights);
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
        public ResponseEntity<List<FlightResponseDTO>> searchFlights(
                @RequestParam String origin,
                @RequestParam String destination,
                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {

            var flights = flightService.searchFlights(origin, destination, fromDate)
                    .stream()
                    .map(flightMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(flights);
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
        @GetMapping("/assign-categories")
        public String assignCategories() {
            int n = flightService.assignCategoriesToExistingFlights();
            return "Vuelos actualizados: " + n;
        }

    }



