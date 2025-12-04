package com.aerolinea.controller;

import com.aerolinea.dto.PassengerDto;
import com.aerolinea.entity.Passenger;
import com.aerolinea.service.PassengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    //  Obtener todos los pasajeros (DTO)
    @GetMapping
    public List<PassengerDto> getAllPassengers() {
        return passengerService.getAllPassengers().stream()
                .map(PassengerDto::new)
                .toList();
    }

    //   Listar pasajeros por vuelo
    @GetMapping("/by-flight/{flightId}")
    public List<PassengerDto> listByFlight(@PathVariable Long flightId) {

        return passengerService.getAllPassengers().stream()
                .filter(p -> p.getFlight() != null && p.getFlight().getId().equals(flightId))
                .map(PassengerDto::new)
                .toList();
    }

    //  Crear (compra) un pasajero — descuenta asiento
    @PostMapping
    public ResponseEntity<PassengerDto> createPassenger(@Valid @RequestBody PassengerDto dto) {
        Passenger passenger = dto.toEntity();
        Passenger saved = passengerService.savePassenger(passenger, dto.getFlightId());
        return ResponseEntity.ok(new PassengerDto(saved));
    }

    //  Otra ruta  para compra
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

    //  Eliminar pasajero
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable Long id) {
        passengerService.deletePassenger(id);
        return ResponseEntity.ok().build();
    }
}
