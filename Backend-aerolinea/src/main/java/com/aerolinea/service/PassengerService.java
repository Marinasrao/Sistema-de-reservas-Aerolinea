package com.aerolinea.service;

import com.aerolinea.entity.Flight;
import com.aerolinea.entity.Passenger;
import com.aerolinea.repository.FlightRepository;
import com.aerolinea.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PassengerService {

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Transactional
    public Passenger savePassenger(Passenger passenger, Long flightId) {
        Flight flight = flightRepository.findForUpdate(flightId)
                .orElseThrow(() -> new NoSuchElementException("Vuelo no encontrado: " + flightId));

        if (flight.getSeatsAvailable() <= 0) {
            throw new DataIntegrityViolationException("No hay asientos disponibles en este vuelo.");
        }

        if (passenger.getChannel() == null || passenger.getChannel().isBlank()) {
            passenger.setChannel("COUNTER");
        }

        String flightClass = passenger.getFlightClass();
        if (flightClass == null || flightClass.isBlank()) {
            throw new IllegalArgumentException("Falta la clase de vuelo (ECONOMY, BUSINESS, FIRST)");
        }

        Set<String> validClasses = Set.of("ECONOMY", "BUSINESS", "FIRST");
        if (!validClasses.contains(flightClass.toUpperCase())) {
            throw new IllegalArgumentException("Clase de vuelo inválida: " + flightClass);
        }

        List<String> available = getAvailableSeats(flight, flightClass);

        if (passenger.getSeatNumber() == null || passenger.getSeatNumber().isBlank()) {
            if (available.isEmpty()) {
                throw new DataIntegrityViolationException("No hay asientos disponibles en clase " + flightClass);
            }
            passenger.setSeatNumber(available.get(0));
        } else {
            if (!available.contains(passenger.getSeatNumber())) {
                throw new DataIntegrityViolationException("Asiento ya ocupado o inválido: " + passenger.getSeatNumber());
            }
        }

        passenger.setPurchasedAt(LocalDateTime.now());
        passenger.setFlight(flight);

        flight.setSeatsAvailable(flight.getSeatsAvailable() - 1);
        flightRepository.save(flight);

        return passengerRepository.save(passenger);
    }


    @Transactional
    public int cancel(Long passengerId, boolean refundSeat) {
        Passenger p = passengerRepository.findById(passengerId)
                .orElseThrow(() -> new NoSuchElementException("Pasajero no encontrado: " + passengerId));

        Long flightId = (p.getFlight() != null) ? p.getFlight().getId() : null;
        if (flightId == null) {
            passengerRepository.deleteById(passengerId);
            return -1;
        }

        Flight flight = flightRepository.findForUpdate(flightId)
                .orElseThrow(() -> new NoSuchElementException("Vuelo no encontrado: " + flightId));

        if (refundSeat) {
            flight.setSeatsAvailable(flight.getSeatsAvailable() + 1);
            flightRepository.save(flight);
        }

        passengerRepository.deleteById(passengerId);
        return flight.getSeatsAvailable();
    }

    @Transactional
    public void deletePassenger(Long id) {
        cancel(id, true);
    }

    public List<Passenger> getAllPassengers() {
        return passengerRepository.findAll();
    }

    private List<String> getAvailableSeats(Flight flight, String flightClass) {
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
}
