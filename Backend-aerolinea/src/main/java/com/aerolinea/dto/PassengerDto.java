package com.aerolinea.dto;

import com.aerolinea.entity.Passenger;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PassengerDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String documentNumber;
    private String channel;
    private String flightClass;
    private String purchasedAt;

    private Long flightId;
    private String flightNumber;
    private String origin;
    private String destination;
    private Double price;
    private String departureDate;
    private String departureTime;

    private String seatNumber;

    public PassengerDto() {
    }

    public PassengerDto(Passenger passenger) {
        this.id = passenger.getId();
        this.firstName = passenger.getFirstName();
        this.lastName = passenger.getLastName();
        this.email = passenger.getEmail();
        this.phone = passenger.getPhone();
        this.documentNumber = passenger.getDocumentNumber();
        this.channel = passenger.getChannel();
        this.flightClass = passenger.getFlightClass();
        this.seatNumber = passenger.getSeatNumber();

        this.purchasedAt = passenger.getPurchasedAt() != null
                ? passenger.getPurchasedAt().toString()
                : null;

        this.flightId = passenger.getFlight() != null
                ? passenger.getFlight().getId()
                : null;

        if (passenger.getFlight() != null) {
            this.flightNumber = passenger.getFlight().getFlightNumber();
            this.origin = passenger.getFlight().getOrigin();
            this.destination = passenger.getFlight().getDestination();
            this.price = passenger.getFlight().getPrice();

            this.departureDate = passenger.getFlight().getDepartureDate() != null
                    ? passenger.getFlight().getDepartureDate().toString()
                    : null;

            this.departureTime = passenger.getFlight().getDepartureTime() != null
                    ? passenger.getFlight().getDepartureTime().toString()
                    : null;
        }
    }

    public Passenger toEntity() {
        Passenger passenger = new Passenger();

        passenger.setId(this.id);
        passenger.setFirstName(this.firstName);
        passenger.setLastName(this.lastName);
        passenger.setEmail(this.email);
        passenger.setPhone(this.phone);
        passenger.setDocumentNumber(this.documentNumber);
        passenger.setChannel(this.channel);
        passenger.setFlightClass(
                this.flightClass != null ? this.flightClass : "ECONOMY"
        );
        passenger.setSeatNumber(this.seatNumber);

        if (this.purchasedAt != null && !this.purchasedAt.isBlank()) {
            try {
                passenger.setPurchasedAt(
                        LocalDateTime.parse(this.purchasedAt)
                );
            } catch (Exception exception) {
                passenger.setPurchasedAt(
                        LocalDate.parse(this.purchasedAt).atStartOfDay()
                );
            }
        }

        return passenger;
    }
}