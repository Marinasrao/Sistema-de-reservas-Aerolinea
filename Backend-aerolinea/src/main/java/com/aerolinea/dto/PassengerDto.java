package com.aerolinea.dto;

import com.aerolinea.entity.Passenger;
import lombok.Data;

import java.time.LocalDate;

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
    private String seatNumber;



    public PassengerDto() {}

    public PassengerDto(Passenger p) {
        this.id = p.getId();
        this.firstName = p.getFirstName();
        this.lastName = p.getLastName();
        this.email = p.getEmail();
        this.phone = p.getPhone();
        this.documentNumber = p.getDocumentNumber();
        this.channel = p.getChannel();
        this.flightClass = p.getFlightClass();
        this.purchasedAt = p.getPurchasedAt() != null ? p.getPurchasedAt().toString() : null;
        this.flightId = (p.getFlight() != null ? p.getFlight().getId() : null);

        if (p.getFlight() != null) {
            this.flightNumber = p.getFlight().getFlightNumber();
            this.origin = p.getFlight().getOrigin();
            this.destination = p.getFlight().getDestination();
            this.price = p.getFlight().getPrice();
        }
        this.seatNumber = p.getSeatNumber();
    }

    public Passenger toEntity() {
        Passenger p = new Passenger();
        p.setId(this.id);
        p.setFirstName(this.firstName);
        p.setLastName(this.lastName);
        p.setEmail(this.email);
        p.setPhone(this.phone);
        p.setDocumentNumber(this.documentNumber);
        p.setChannel(this.channel);
        p.setFlightClass(this.flightClass != null ? this.flightClass : "ECONOMY");

        if (this.purchasedAt != null) {
            p.setPurchasedAt(LocalDate.parse(this.purchasedAt).atStartOfDay());
        }

        return p;
    }
}
