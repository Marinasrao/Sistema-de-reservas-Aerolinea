package com.aerolinea.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecommendationResponseDTO {

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

    private String longDescription;
    private String mainImage;
    private String image1;
    private String image2;
    private String image3;
    private String image4;

    private Long categoryId;
    private String categoryName;

    private List<FlightResponseDTO> flights;
}
