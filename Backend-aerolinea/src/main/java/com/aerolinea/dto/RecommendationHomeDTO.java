package com.aerolinea.dto;

public class RecommendationHomeDTO {

    private Long id;
    private String title;
    private String shortDescription;
    private String mainImage;
    private Double price;
    private String departureDate;

    public RecommendationHomeDTO(
            Long id,
            String title,
            String shortDescription,
            String mainImage,
            Double price,
            String departureDate
    ) {
        this.id = id;
        this.title = title;
        this.shortDescription = shortDescription;
        this.mainImage = mainImage;
        this.price = price;
        this.departureDate = departureDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getMainImage() {
        return mainImage;
    }

    public Double getPrice() {
        return price;
    }

    public String getDepartureDate() {
        return departureDate;
    }
}
