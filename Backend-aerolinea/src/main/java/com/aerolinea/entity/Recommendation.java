package com.aerolinea.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Lob;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;


@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Entity
@Table(name = "recommendations")
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
    private Integer discountPercent;



    @Lob
    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;
        private String mainImage;
    private String image1;
    private String image2;
    private String image3;
    private String image4;


    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("recommendation")
    private List<Flight> flights = new ArrayList<>();


}
