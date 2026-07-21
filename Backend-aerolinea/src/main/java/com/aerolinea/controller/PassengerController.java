package com.aerolinea.controller;

import com.aerolinea.dto.OnlineReservationRequest;
import com.aerolinea.dto.PassengerDto;
import com.aerolinea.entity.Passenger;
import com.aerolinea.service.EmailService;
import com.aerolinea.service.PassengerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/available-seats")
    public ResponseEntity<List<String>> getAvailableSeats(
            @RequestParam Long flightId,
            @RequestParam String flightClass
    ) {
        return ResponseEntity.ok(
                passengerService.getAvailableSeatsForFlight(
                        flightId,
                        flightClass
                )
        );
    }

    // Listar pasajeros por vuelo
    @GetMapping("/by-flight/{flightId}")
    public List<PassengerDto> listByFlight(@PathVariable Long flightId) {
        return passengerService.getAllPassengers().stream()
                .filter(p -> p.getFlight() != null && p.getFlight().getId().equals(flightId))
                .map(PassengerDto::new)
                .toList();
    }

    // Crear pasajero por ventanilla/admin — descuenta asiento
    @PostMapping
    public ResponseEntity<PassengerDto> createPassenger(
            @Valid @RequestBody PassengerDto dto
    ) {
        Passenger passenger = dto.toEntity();
        Passenger saved = passengerService.savePassenger(passenger, dto.getFlightId());
        return ResponseEntity.ok(new PassengerDto(saved));
    }

    // Crear reserva online — guarda pasajeros, bloquea asientos y envía correo de confirmación
    @PostMapping("/online-reservation")
    public ResponseEntity<List<PassengerDto>> createOnlineReservation(
            @Valid @RequestBody OnlineReservationRequest request,
            Authentication authentication
    ) {
        List<Passenger> savedPassengers =
                passengerService.saveOnlineReservation(
                        request.getPassengers()
                );

        String registeredUserEmail = authentication != null
                ? authentication.getName()
                : "";

        if (registeredUserEmail != null
                && !registeredUserEmail.isBlank()
                && !"anonymousUser".equalsIgnoreCase(registeredUserEmail)) {
            try {
                emailService.sendReservationConfirmationEmail(
                        registeredUserEmail,
                        request,
                        savedPassengers
                );
            } catch (Exception ex) {
                System.err.println(
                        "No se pudo enviar el correo de confirmación de reserva: "
                                + ex.getMessage()
                );
            }
        } else {
            System.err.println(
                    "No se pudo enviar el correo de confirmación porque no se obtuvo el email del usuario registrado."
            );
        }

        List<PassengerDto> response = savedPassengers.stream()
                .map(PassengerDto::new)
                .toList();

        return ResponseEntity.ok(response);

    }

    // Otra ruta para compra
    @PostMapping("/purchase")
    public ResponseEntity<?> purchase(@Valid @RequestBody PassengerDto dto) {
        Passenger passenger = dto.toEntity();
        Passenger saved = passengerService.savePassenger(passenger, dto.getFlightId());

        return ResponseEntity.ok(Map.of(
                "passengerId", saved.getId(),
                "flightId", dto.getFlightId(),
                "channel", saved.getChannel()
        ));
    }

    // Eliminar pasajero
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable Long id) {
        passengerService.deletePassenger(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public Page<PassengerDto> getAllPassengers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return passengerService.getPassengers(page, size)
                .map(PassengerDto::new);
    }
}