package com.aerolinea.service;

import com.aerolinea.entity.Flight;
import com.aerolinea.entity.Passenger;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.repository.FlightRepository;
import com.aerolinea.repository.RecommendationRepository;
import com.aerolinea.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.NoSuchElementException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class FlightService {

    @Autowired private FlightRepository flightRepository;
    @Autowired private RecommendationRepository recommendationRepository;
    @Autowired private PassengerRepository passengerRepository;

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HHmm");

    public Flight saveFlight(Flight flight) throws IllegalArgumentException {
        boolean exists = flightRepository.existsByFlightNumberAndDepartureDateAndOriginAndDestination(
                flight.getFlightNumber(),
                flight.getDepartureDate(),
                flight.getOrigin(),
                flight.getDestination()
        );
        if (exists) {
            throw new IllegalArgumentException("Ya existe un vuelo con ese número, origen, destino y fecha");
        }
        return flightRepository.save(flight);
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public List<Flight> getRandomFlights(int max) {
        List<Flight> allFlights = flightRepository.findAll();
        Collections.shuffle(allFlights);
        return allFlights.stream().limit(Math.max(1, max)).toList();
    }

    public Optional<Flight> findById(Long id) {
        return flightRepository.findById(id);
    }

    public Flight updateFlight(Long id, Flight flight) {
        Flight existing = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vuelo no encontrado con ID: " + id));

        if (flight.getFlightNumber() != null) existing.setFlightNumber(flight.getFlightNumber());
        if (flight.getOrigin() != null) existing.setOrigin(flight.getOrigin());
        if (flight.getDestination() != null) existing.setDestination(flight.getDestination());
        if (flight.getDepartureDate() != null) existing.setDepartureDate(flight.getDepartureDate());
        if (flight.getDepartureTime() != null) existing.setDepartureTime(flight.getDepartureTime());
        if (flight.getArrivalDate() != null) existing.setArrivalDate(flight.getArrivalDate());
        if (flight.getArrivalTime() != null) existing.setArrivalTime(flight.getArrivalTime());

        existing.setPrice(flight.getPrice());
        existing.setSeatsAvailable(flight.getSeatsAvailable());
        existing.setEconomySeats(flight.getEconomySeats());
        existing.setBusinessSeats(flight.getBusinessSeats());
        existing.setFirstSeats(flight.getFirstSeats());

        if (flight.getAirline() != null) existing.setAirline(flight.getAirline());
        if (flight.getAircraftType() != null) existing.setAircraftType(flight.getAircraftType());
        if (flight.getFlightStatus() != null) existing.setFlightStatus(flight.getFlightStatus());
        if (flight.getDescription() != null) existing.setDescription(flight.getDescription());
        if (flight.getImageUrls() != null) existing.setImageUrls(flight.getImageUrls());
        if (flight.getRecommendation() != null) existing.setRecommendation(flight.getRecommendation());

        return flightRepository.save(existing);
    }

    public void deleteFlight(Long id) {
        deleteFlight(id, false);
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
                "message", canDelete ? "Se puede eliminar" : "El vuelo tiene pasajeros asociados"
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
        return flightRepository.findByDestinationIgnoreCaseAndDepartureDateGreaterThanEqual(destination, LocalDate.now());
    }


    public List<Flight> searchFlightsByDestinationAndDateRange(String destination, LocalDate start, LocalDate end) {
        return flightRepository.findByDestinationIgnoreCaseAndDepartureDateBetween(
                destination, start, end
        );
    }


    public int backfillFlightsForAllRecommendations() {
        List<String> defaultAirlines = Arrays.asList("Aerolíneas Argentinas", "Jetsmart", "Flybondi");
        LocalTime[] idaSlots = { LocalTime.of(8, 30), LocalTime.of(19, 15) };
        LocalTime[] vueltaSlots = { LocalTime.of(10, 45), LocalTime.of(21, 0) };

        int created = 0;

        for (Recommendation rec : recommendationRepository.findAll()) {
            String origin = normalizeCity(firstNonBlank(rec.getOrigin(), tryInferFromTitle(rec.getTitle(), 0), "Buenos Aires"));
            String destination = normalizeCity(firstNonBlank(rec.getDestination(), tryInferFromTitle(rec.getTitle(), 1), null));
            if (isBlank(destination)) continue;

            List<LocalDate> fechasIda = new ArrayList<>();
            LocalDate hoy = LocalDate.now();
            LocalDate fin = hoy.plusMonths(3);
            while (!hoy.isAfter(fin)) {
                fechasIda.add(hoy);
                hoy = hoy.plusDays(7);
            }

            for (String airline : defaultAirlines) {
                for (LocalDate d : fechasIda) {
                    for (LocalTime t : idaSlots) {
                        String flightNumber = buildFlightNumber(airline, origin, destination, d, t);
                        created += maybeCreateFlight(
                                flightNumber, origin, destination, d, t, d, t.plusHours(2),
                                airline, 150000, "Boeing 737", "programado", rec
                        );
                    }
                }

                for (LocalDate d : fechasIda) {
                    LocalDate backDate = d.plusDays(7);
                    for (LocalTime t : vueltaSlots) {
                        String flightNumber = buildFlightNumber(airline, destination, origin, backDate, t);
                        created += maybeCreateFlight(
                                flightNumber, destination, origin, backDate, t, backDate, t.plusHours(2),
                                airline, 145000, "Boeing 737", "programado", rec
                        );
                    }
                }
            }
        }

        return created;
    }

    public int deleteAutoGeneratedFlights() {
        List<Flight> autos = flightRepository.findByDescriptionContainingIgnoreCase("generado automáticamente");
        int n = autos.size();
        if (n > 0) flightRepository.deleteAll(autos);
        return n;
    }

    public Map<String, Integer> reseedAutoFlights() {
        int deleted = deleteAutoGeneratedFlights();
        int created = backfillFlightsForAllRecommendations();
        return Map.of("deleted", deleted, "created", created);
    }

    private int maybeCreateFlight(String flightNumber, String origin, String destination,
                                  LocalDate depDate, LocalTime depTime,
                                  LocalDate arrDate, LocalTime arrTime,
                                  String airline, double price, String aircraft, String status,
                                  Recommendation rec) {
        boolean exists = flightRepository.existsByFlightNumberAndDepartureDateAndOriginAndDestination(
                flightNumber, depDate, origin, destination
        );
        if (exists) return 0;

        Flight f = new Flight();
        f.setFlightNumber(flightNumber);
        f.setOrigin(origin);
        f.setDestination(destination);
        f.setDepartureDate(depDate);
        f.setDepartureTime(depTime);
        f.setArrivalDate(arrDate);
        f.setArrivalTime(arrTime);
        f.setPrice(price);
        f.setSeatsAvailable(120);
        f.setAirline(airline);
        f.setAircraftType(aircraft);
        f.setFlightStatus(status);
        f.setDescription("Vuelo generado automáticamente para backfill.");
        f.setRecommendation(rec);

        f.setEconomySeats(120);
        f.setBusinessSeats(20);
        f.setFirstSeats(10);

        flightRepository.save(f);
        return 1;
    }

    private String buildFlightNumber(String airline, String ori, String des, LocalDate d, LocalTime t) {
        String a = airlineCode(airline);
        String o = code(ori);
        String ds = code(des);
        String hh = t.format(HHMM);
        return a + "-" + o + "-" + ds + "-" + hh;
    }

    private String airlineCode(String name) {
        if (name == null) return "XX";
        String n = name.toLowerCase();
        if (n.contains("aerolíneas")) return "AR";
        if (n.contains("jetsmart")) return "JS";
        if (n.contains("flybondi")) return "FB";
        return "XX";
    }

    private String code(String city) {
        if (city == null || city.isBlank()) return "UNK";
        String c = Normalizer.normalize(city, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^A-Za-z ]", "")
                .replaceAll("\\s+", "")
                .toUpperCase(Locale.ROOT);
        return c.length() >= 3 ? c.substring(0, 3) : String.format("%-3s", c).replace(' ', 'X');
    }

    private String firstNonBlank(String... vals) {
        for (String v : vals) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return null;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String normalizeCity(String s) {
        if (isBlank(s)) return s;
        s = s.replaceAll("\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}", "");
        s = s.replaceAll("\\bAR\\s*\\$\\s*\\d+[\\.,\\d]*", "");
        s = s.replaceAll("[-–—]", " ");
        s = s.replaceAll("\\s{2,}", " ").trim();
        return s;
    }

    private String tryInferFromTitle(String title, int idx) {
        if (isBlank(title)) return null;
        var pattern = Pattern.compile(
                "^\\s*([A-Za-zÁÉÍÓÚÑñ]+(?:\\s+[A-Za-zÁÉÍÓÚÑñ]+)*)\\s*[-–—]\\s*([A-Za-zÁÉÍÓÚÑñ]+(?:\\s+[A-Za-zÁÉÍÓÚÑñ]+)*)"
        );
        var m = pattern.matcher(title);
        if (!m.find()) return null;
        return normalizeCity(m.group(idx + 1));
    }

    public List<String> getDistinctDestinations() {
        return flightRepository.findDistinctDestinations();
    }

    public List<Flight> searchFuzzy(String term) {
        if (term == null || term.isBlank()) return Collections.emptyList();
        return flightRepository.searchFuzzy(term.trim());
    }

    public List<String> getAvailableSeats(Long flightId, String flightClass) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new NoSuchElementException("Vuelo no encontrado"));

        int totalSeats = switch (flightClass.toUpperCase()) {
            case "BUSINESS" -> flight.getBusinessSeats();
            case "FIRST" -> flight.getFirstSeats();
            default -> flight.getEconomySeats();
        };

        String prefix = switch (flightClass.toUpperCase()) {
            case "BUSINESS" -> "B";
            case "FIRST" -> "F";
            default -> "A";
        };

        List<String> all = new ArrayList<>();
        for (int i = 1; i <= totalSeats; i++) {
            all.add(prefix + i);
        }

        List<String> occupied = passengerRepository
                .findByFlightIdAndFlightClass(flight.getId(), flightClass)
                .stream()
                .map(Passenger::getSeatNumber)
                .filter(Objects::nonNull)
                .toList();

        all.removeAll(occupied);
        return all;
    }

    @Transactional
    public int deletePastFlights() {
        LocalDate hoy = LocalDate.now();
        List<Flight> vencidos = flightRepository.findByDepartureDateBefore(hoy);
        int total = 0;

        for (Flight vuelo : vencidos) {
            // Borrar pasajeros asociados primero
            passengerRepository.deleteByFlight_Id(vuelo.getId());

            // Luego borrar el vuelo
            flightRepository.deleteById(vuelo.getId());
            total++;
        }

        return total;
    }

    public List<Flight> searchFlights(String origin, String destination, LocalDate fromDate) {
        return flightRepository.findByOriginAndDestinationAndDepartureDateGreaterThanEqualOrderByDepartureDateAsc(
                origin, destination, fromDate
        );
    }


}
