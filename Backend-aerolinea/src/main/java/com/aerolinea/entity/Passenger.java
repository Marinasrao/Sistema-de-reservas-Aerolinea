package com.aerolinea.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nombre obligatorio")
    private String firstName;

    @NotBlank(message = "Apellido obligatorio")
    private String lastName;

    @Email(message = "Email inválido")
    private String email;

    private String phone;

    @NotBlank(message = "Documento obligatorio")
    private String documentNumber;

    @NotBlank
    @Pattern(regexp = "COUNTER|ONLINE", message = "channel debe ser COUNTER u ONLINE")
    private String channel;

    @NotBlank(message = "Clase de vuelo obligatoria")
    private String flightClass = "ECONOMY";

    private LocalDateTime purchasedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flight_id")
    @JsonIgnore
    private Flight flight;

    @Column(name = "seat_number")
    private String seatNumber;


}
