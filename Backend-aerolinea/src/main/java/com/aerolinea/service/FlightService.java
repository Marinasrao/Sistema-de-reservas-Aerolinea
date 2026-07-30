package com.aerolinea.service;

import com.aerolinea.entity.Category;
import com.aerolinea.entity.Flight;
import com.aerolinea.entity.Passenger;
import com.aerolinea.repository.CategoryRepository;
import com.aerolinea.repository.FlightRepository;
import com.aerolinea.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FlightService {



    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Flight saveFlight(Flight flight) {
        validateFlightDuration(flight);

        boolean exists = flightRepository
                .existsByFlightNumberAndDepartureDateAndOriginAndDestination(
                        flight.getFlightNumber(),
                        flight.getDepartureDate(),
                        flight.getOrigin(),
                        flight.getDestination()
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "Ya existe un vuelo con ese número, origen, destino y fecha"
            );
        }

        return flightRepository.save(flight);
    }

    public Page<Flight> getFlightsPaged(Pageable pageable) {
        return flightRepository.findAll(pageable);
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public List<Flight> getRandomFlights(int max) {
        List<Flight> allFlights = flightRepository.findAll();
        Collections.shuffle(allFlights);
        return allFlights.stream()
                .limit(Math.max(1, max))
                .toList();
    }

    public Optional<Flight> findById(Long id) {
        return flightRepository.findById(id);
    }

    private void validateFlightDuration(Flight flight) {
        if (
                flight.getDepartureDate() == null ||
                        flight.getDepartureTime() == null ||
                        flight.getArrivalDate() == null ||
                        flight.getArrivalTime() == null
        ) {
            return;
        }

        LocalDateTime departure = LocalDateTime.of(
                flight.getDepartureDate(),
                flight.getDepartureTime()
        );

        LocalDateTime arrival = LocalDateTime.of(
                flight.getArrivalDate(),
                flight.getArrivalTime()
        );

        long hours = Duration.between(departure, arrival).toHours();

        if (hours < 1 || hours > 24) {
            throw new IllegalArgumentException(
                    "La duración del vuelo debe ser entre 1 y 24 horas"
            );
        }
    }

    public Flight updateFlight(Long id, Flight flight) {
        Flight existing = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Vuelo no encontrado con ID: " + id
                ));

        if (flight.getFlightNumber() != null) {
            existing.setFlightNumber(flight.getFlightNumber());
        }

        if (flight.getOrigin() != null) {
            existing.setOrigin(flight.getOrigin());
        }

        if (flight.getDestination() != null) {
            existing.setDestination(flight.getDestination());
        }

        if (flight.getDepartureDate() != null) {
            existing.setDepartureDate(flight.getDepartureDate());
        }

        if (flight.getDepartureTime() != null) {
            existing.setDepartureTime(flight.getDepartureTime());
        }

        if (flight.getArrivalDate() != null) {
            existing.setArrivalDate(flight.getArrivalDate());
        }

        if (flight.getArrivalTime() != null) {
            existing.setArrivalTime(flight.getArrivalTime());
        }

        existing.setPrice(flight.getPrice());
        existing.setSeatsAvailable(flight.getSeatsAvailable());
        existing.setEconomySeats(flight.getEconomySeats());
        existing.setBusinessSeats(flight.getBusinessSeats());
        existing.setFirstSeats(flight.getFirstSeats());

        if (flight.getAirline() != null) {
            existing.setAirline(flight.getAirline());
        }

        if (flight.getAircraftType() != null) {
            existing.setAircraftType(flight.getAircraftType());
        }

        if (flight.getFlightStatus() != null) {
            existing.setFlightStatus(flight.getFlightStatus());
        }

        if (flight.getDescription() != null) {
            existing.setDescription(flight.getDescription());
        }

        if (flight.getRecommendation() != null) {
            existing.setRecommendation(flight.getRecommendation());
        }

        if (flight.getCategory() != null) {
            existing.setCategory(flight.getCategory());
        }

        validateFlightDuration(existing);

        return flightRepository.save(existing);
    }

    public Map<String, Object> deleteGuard(Long flightId) {
        if (!flightRepository.existsById(flightId)) {
            throw new NoSuchElementException("Vuelo no encontrado: " + flightId);
        }

        long passengers = passengerRepository.countByFlight_Id(flightId);
        boolean canDelete = passengers == 0;

        return Map.of(
                "canDelete", canDelete,
                "counts", Map.of("passengers", passengers),
                "message", canDelete
                        ? "Se puede eliminar"
                        : "El vuelo tiene pasajeros asociados"
        );
    }

    @Transactional
    public void deleteFlight(Long id, boolean force) {
        if (!flightRepository.existsById(id)) {
            throw new NoSuchElementException("Vuelo no encontrado: " + id);
        }

        long booked = passengerRepository.countByFlight_Id(id);

        if (booked > 0 && !force) {
            throw new DataIntegrityViolationException(
                    "El vuelo tiene " + booked + " pasajero(s) asociado(s)."
            );
        }

        if (booked > 0 && force) {
            passengerRepository.deleteByFlight_Id(id);
        }

        flightRepository.deleteById(id);
    }

    public List<Flight> getFlightsByRecommendation(Long recommendationId) {
        return flightRepository.findByRecommendationId(recommendationId);
    }

    public List<Flight> getFlightsByDestination(String destination) {
        return flightRepository
                .findByDestinationIgnoreCaseAndDepartureDateGreaterThanEqual(
                        destination,
                        LocalDate.now()
                );
    }

    public List<Flight> searchFlightsByDestinationAndDateRange(
            String destination,
            LocalDate start,
            LocalDate end
    ) {
        return flightRepository.findByDestinationIgnoreCaseAndDepartureDateBetween(
                destination,
                start,
                end
        );
    }

    public List<Flight> searchRoundtripExactDate(
            String origin,
            String destination,
            LocalDate departureDate
    ) {
        return flightRepository.searchExactDate(
                origin,
                destination,
                departureDate
        );
    }

    public int assignCategoriesToExistingFlights() {
        List<String> argentinaKeywords = List.of(
                "buenos aires", "aeroparque", "ezeiza",
                "cordoba", "rosario", "mendoza", "bariloche",
                "el calafate", "iguazu", "ushuaia", "salta",
                "san juan", "neuquen", "trelew", "san luis",
                "comodoro rivadavia", "mar del plata", "bahia blanca"
        );

        int updated = 0;

        for (Flight flight : flightRepository.findAll()) {
            String origin = normalizeCityName(flight.getOrigin());
            String destination = normalizeCityName(flight.getDestination());
            String airline = flight.getAirline();

            Category newCategory;

            if (airline != null && airline.equalsIgnoreCase("SkyPremium")) {
                newCategory = getCategoryByTitle("Premium");
            } else if (airline != null && airline.equalsIgnoreCase("SkiWings")) {
                newCategory = getCategoryByTitle("Low Cost");
            } else {
                boolean originAR = containsKeyword(origin, argentinaKeywords);
                boolean destinationAR = containsKeyword(destination, argentinaKeywords);

                if (originAR && destinationAR) {
                    newCategory = getCategoryByTitle("Nacionales");
                } else {
                    newCategory = getCategoryByTitle("Internacionales");
                }
            }

            flight.setCategory(newCategory);
            flightRepository.save(flight);
            updated++;
        }

        return updated;
    }

    public Map<Category, List<Flight>> getFeaturedOffersByCategory(
            List<Long> categoryIds,
            int limitPerCategory
    ) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }

        int safeLimit = Math.min(Math.max(limitPerCategory, 1), 6);
        Set<Long> selectedIds = new LinkedHashSet<>(categoryIds);

        List<Flight> candidateFlights = flightRepository
                .findByCategory_IdInAndDepartureDateGreaterThanEqual(
                        new ArrayList<>(selectedIds),
                        LocalDate.now()
                )
                .stream()
                .filter(flight -> flight.getCategory() != null)
                .filter(flight -> flight.getSeatsAvailable() > 0)
                .filter(flight -> {
                    String status = flight.getFlightStatus();

                    return status == null
                            || (
                            !status.equalsIgnoreCase("cancelado")
                                    && !status.equalsIgnoreCase("cancelled")
                                    && !status.equalsIgnoreCase("canceled")
                    );
                })
                .sorted(
                        Comparator
                                .comparing(
                                        Flight::getPrice,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                )
                                .thenComparing(
                                        Flight::getDepartureDate,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                )
                                .thenComparing(
                                        Flight::getDepartureTime,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                )
                )
                .toList();

        Map<Long, Category> categoriesById = new LinkedHashMap<>();

        for (Category category : categoryRepository.findAllById(selectedIds)) {
            categoriesById.put(category.getId(), category);
        }

        Map<Category, List<Flight>> result = new LinkedHashMap<>();

        for (Long categoryId : selectedIds) {
            Category category = categoriesById.get(categoryId);

            if (category == null) {
                continue;
            }

            Map<String, Flight> oneFlightPerDestination = new LinkedHashMap<>();

            for (Flight flight : candidateFlights) {
                if (!Objects.equals(
                        flight.getCategory().getId(),
                        categoryId
                )) {
                    continue;
                }

                String origin = normalizeCityForSearch(flight.getOrigin());
                String destination = normalizeCityForSearch(flight.getDestination());

                boolean isMainOrigin =
                        origin.equals("buenos aires")
                                || origin.equals("aeroparque")
                                || origin.equals("ezeiza");

                boolean goesBackToBuenosAires =
                        destination.equals("buenos aires")
                                || destination.equals("aeroparque")
                                || destination.equals("ezeiza");

                if (goesBackToBuenosAires && !isMainOrigin) {
                    continue;
                }

                oneFlightPerDestination.putIfAbsent(destination, flight);

                if (oneFlightPerDestination.size() >= safeLimit) {
                    break;
                }
            }

            result.put(
                    category,
                    new ArrayList<>(oneFlightPerDestination.values())
            );
        }

        return result;
    }

    public List<String> getDistinctDestinations() {
        return flightRepository.findDistinctDestinations();
    }

    public List<Flight> searchFuzzy(String term) {
        if (term == null || term.isBlank()) {
            return Collections.emptyList();
        }

        return flightRepository.searchFuzzy(term.trim());
    }

    public List<String> getDistinctCities() {
        List<String> origins = flightRepository.findDistinctOrigins();
        List<String> destinations = flightRepository.findDistinctDestinations();

        return java.util.stream.Stream.concat(
                        origins.stream(),
                        destinations.stream()
                )
                .distinct()
                .sorted()
                .toList();
    }

    public List<String> getAvailableSeats(Long flightId, String flightClass) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Vuelo no encontrado"
                ));

        String normalizedClass =
                flightClass == null || flightClass.isBlank()
                        ? "ECONOMY"
                        : flightClass.toUpperCase(Locale.ROOT);

        int totalSeats = switch (normalizedClass) {
            case "BUSINESS" -> flight.getBusinessSeats();
            case "FIRST" -> flight.getFirstSeats();
            default -> flight.getEconomySeats();
        };

        String prefix = switch (normalizedClass) {
            case "BUSINESS" -> "B";
            case "FIRST" -> "F";
            default -> "A";
        };

        List<String> allSeats = new ArrayList<>();

        for (int i = 1; i <= totalSeats; i++) {
            allSeats.add(prefix + i);
        }

        List<String> occupiedSeats = passengerRepository
                .findByFlight_IdAndFlightClassIgnoreCase(
                        flight.getId(),
                        normalizedClass
                )
                .stream()
                .map(Passenger::getSeatNumber)
                .filter(Objects::nonNull)
                .toList();

        allSeats.removeAll(occupiedSeats);

        return allSeats;
    }

    @Transactional
    public int deletePastFlights() {
        LocalDate today = LocalDate.now();
        List<Flight> expiredFlights =
                flightRepository.findByDepartureDateBefore(today);

        int total = 0;

        for (Flight flight : expiredFlights) {
            passengerRepository.deleteByFlight_Id(flight.getId());
            flightRepository.deleteById(flight.getId());
            total++;
        }

        return total;
    }

    public List<Flight> searchFlights(
            String origin,
            String destination,
            LocalDate fromDate
    ) {
        if (origin == null || destination == null || fromDate == null) {
            return Collections.emptyList();
        }

        String normalizedOrigin = normalizeCityForSearch(origin);
        String normalizedDestination = normalizeCityForSearch(destination);

        return flightRepository.findAll()
                .stream()
                .filter(flight -> flight.getDepartureDate() != null)
                .filter(flight -> flight.getOrigin() != null)
                .filter(flight -> flight.getDestination() != null)
                .filter(flight -> flight.getDepartureDate().equals(fromDate))
                .filter(flight -> normalizeCityForSearch(
                        flight.getOrigin()
                ).equals(normalizedOrigin))
                .filter(flight -> normalizeCityForSearch(
                        flight.getDestination()
                ).equals(normalizedDestination))
                .sorted(
                        Comparator.comparing(
                                Flight::getDepartureTime,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .toList();
    }

    public List<String> getDestinationsByOrigin(String origin) {
        return flightRepository.findDestinationsByOrigin(origin);
    }

    public List<LocalDate> getAvailableDatesByRoute(
            String origin,
            String destination,
            LocalDate fromDate
    ) {
        if (fromDate == null) {
            fromDate = LocalDate.now();
        }

        return flightRepository.findAvailableDatesByRoute(
                origin,
                destination,
                fromDate
        );
    }

    private String normalizeCityName(String text) {
        if (text == null) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-zA-Z\\s]", "")
                .toLowerCase()
                .trim();
    }

    private String normalizeCityForSearch(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-zA-Z\\s]", "")
                .replaceAll("\\s+", " ")
                .toLowerCase()
                .trim();
    }

    private boolean containsKeyword(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }

    private Category getCategoryByTitle(String title) {
        return categoryRepository.findByTitleIgnoreCase(title)
                .orElseThrow(() -> new RuntimeException(
                        "Categoría no encontrada: " + title
                ));
    }
}