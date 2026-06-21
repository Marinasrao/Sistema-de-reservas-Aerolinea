package com.aerolinea.service;

import com.aerolinea.entity.Flight;
import com.aerolinea.entity.Passenger;
import com.aerolinea.repository.FlightRepository;
import com.aerolinea.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

@Service
public class PassengerService {

    private static final Set<String> VALID_CLASSES =
            Set.of("ECONOMY", "BUSINESS", "FIRST");

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Transactional
    public Passenger savePassenger(Passenger passenger, Long flightId) {
        Flight flight = flightRepository.findForUpdate(flightId)
                .orElseThrow(() ->
                        new NoSuchElementException("Vuelo no encontrado: " + flightId)
                );

        if (flight.getSeatsAvailable() <= 0) {
            throw new DataIntegrityViolationException(
                    "No hay asientos disponibles en este vuelo."
            );
        }

        String channel = normalizeChannel(passenger.getChannel());
        String flightClass = normalizeFlightClass(passenger.getFlightClass());

        passenger.setChannel(channel);
        passenger.setFlightClass(flightClass);

        if (passengerRepository.existsByFlight_IdAndDocumentNumber(
                flightId,
                passenger.getDocumentNumber()
        )) {
            throw new DataIntegrityViolationException(
                    "Ya existe un pasajero con ese documento para este vuelo."
            );
        }

        List<String> availableSeats = getAvailableSeats(flight, flightClass);

        if (availableSeats.isEmpty()) {
            throw new DataIntegrityViolationException(
                    "No hay asientos disponibles en la clase " + flightClass + "."
            );
        }

        String selectedSeat = passenger.getSeatNumber() == null
                ? ""
                : passenger.getSeatNumber().trim().toUpperCase(Locale.ROOT);

        if (selectedSeat.isBlank()) {
            passenger.setSeatNumber(availableSeats.get(0));
        } else {
            if (!availableSeats.contains(selectedSeat)) {
                throw new DataIntegrityViolationException(
                        "El asiento seleccionado ya está ocupado o no corresponde a esta clase."
                );
            }

            passenger.setSeatNumber(selectedSeat);
        }

        if (passengerRepository.existsByFlight_IdAndSeatNumberIgnoreCase(
                flightId,
                passenger.getSeatNumber()
        )) {
            throw new DataIntegrityViolationException(
                    "El asiento seleccionado acaba de ocuparse. Elegí otro disponible."
            );
        }

        passenger.setPurchasedAt(LocalDateTime.now());
        passenger.setFlight(flight);

        flight.setSeatsAvailable(flight.getSeatsAvailable() - 1);
        flightRepository.save(flight);

        return passengerRepository.save(passenger);
    }

    public List<String> getAvailableSeatsForFlight(
            Long flightId,
            String flightClass
    ) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() ->
                        new NoSuchElementException("Vuelo no encontrado: " + flightId)
                );

        return getAvailableSeats(flight, normalizeFlightClass(flightClass));
    }

    @Transactional
    public int cancel(Long passengerId, boolean refundSeat) {
        Passenger passenger = passengerRepository.findById(passengerId)
                .orElseThrow(() ->
                        new NoSuchElementException("Pasajero no encontrado: " + passengerId)
                );

        Long flightId = passenger.getFlight() != null
                ? passenger.getFlight().getId()
                : null;

        if (flightId == null) {
            passengerRepository.deleteById(passengerId);
            return -1;
        }

        Flight flight = flightRepository.findForUpdate(flightId)
                .orElseThrow(() ->
                        new NoSuchElementException("Vuelo no encontrado: " + flightId)
                );

        if (refundSeat) {
            flight.setSeatsAvailable(flight.getSeatsAvailable() + 1);
            flightRepository.save(flight);
        }

        passengerRepository.deleteById(passengerId);

        return flight.getSeatsAvailable();
    }

    @Transactional
    public void deletePassenger(Long passengerId) {
        cancel(passengerId, true);
    }

    public List<Passenger> getAllPassengers() {
        return passengerRepository.findAll();
    }

    public Page<Passenger> getPassengers(int page, int size) {
        return passengerRepository.findAll(PageRequest.of(page, size));
    }

    private String normalizeChannel(String channel) {
        if (channel == null || channel.isBlank()) {
            return "COUNTER";
        }

        String normalizedChannel = channel.trim().toUpperCase(Locale.ROOT);

        if (!Set.of("COUNTER", "ONLINE").contains(normalizedChannel)) {
            throw new IllegalArgumentException(
                    "Canal inválido. Debe ser COUNTER u ONLINE."
            );
        }

        return normalizedChannel;
    }

    private String normalizeFlightClass(String flightClass) {
        if (flightClass == null || flightClass.isBlank()) {
            return "ECONOMY";
        }

        String normalizedClass = flightClass.trim().toUpperCase(Locale.ROOT);

        if (!VALID_CLASSES.contains(normalizedClass)) {
            throw new IllegalArgumentException(
                    "Clase inválida. Debe ser ECONOMY, BUSINESS o FIRST."
            );
        }

        return normalizedClass;
    }

    private List<String> getAvailableSeats(
            Flight flight,
            String flightClass
    ) {
        int totalSeats = switch (flightClass) {
            case "BUSINESS" -> flight.getBusinessSeats();
            case "FIRST" -> flight.getFirstSeats();
            default -> flight.getEconomySeats();
        };

        String prefix = switch (flightClass) {
            case "BUSINESS" -> "B";
            case "FIRST" -> "F";
            default -> "A";
        };

        List<String> allSeats = new ArrayList<>();

        for (int seat = 1; seat <= totalSeats; seat++) {
            allSeats.add(prefix + seat);
        }

        List<String> occupiedSeats = passengerRepository
                .findByFlight_IdAndFlightClassIgnoreCase(
                        flight.getId(),
                        flightClass
                )
                .stream()
                .map(Passenger::getSeatNumber)
                .filter(Objects::nonNull)
                .map(seat -> seat.trim().toUpperCase(Locale.ROOT))
                .toList();

        allSeats.removeAll(occupiedSeats);

        return allSeats;
    }
}