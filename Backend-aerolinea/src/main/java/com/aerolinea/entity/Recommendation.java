package com.aerolinea.entity;

import com.aerolinea.entity.Category;
import com.aerolinea.entity.Flight;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recommendations", schema = "aerolinea_db")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String origin;
    private String destination;
    private String departureDate;
    private String returnDate;
    private Double price;
    private String imageUrl;
    private String shortDescription;
    private String flightType;
    private String airport;
    private Double discountPercent;

    @Lob
    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    private String mainImage;
    private String image1;
    private String image2;
    private String image3;
    private String image4;


    @ManyToMany
    @JoinTable(
            name = "recommendation_categories",
            joinColumns = @JoinColumn(name = "recommendation_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();


    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("recommendation")
    private List<Flight> flights = new ArrayList<>();
}
