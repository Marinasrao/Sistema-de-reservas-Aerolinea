package com.aerolinea.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(
        name = "cities",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_city_name",
                        columnNames = "name"
                )
        }
)
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(length = 120)
    private String country;

    @Column(name = "airport_code", length = 10)
    private String airportCode;

    @Column(nullable = false)
    private boolean active = true;
}