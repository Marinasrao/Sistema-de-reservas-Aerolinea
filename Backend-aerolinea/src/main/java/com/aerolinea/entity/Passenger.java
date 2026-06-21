package com.aerolinea.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(
        name = "passenger",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_passenger_flight_seat",
                        columnNames = {"flight_id", "seat_number"}
                )
        }
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @Pattern(
            regexp = "COUNTER|ONLINE",
            message = "channel debe ser COUNTER u ONLINE"
    )
    private String channel;

    @NotBlank(message = "Clase de vuelo obligatoria")
    private String flightClass = "ECONOMY";

    private LocalDateTime purchasedAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "flight_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Flight flight;

    @Column(name = "seat_number")
    private String seatNumber;
}
