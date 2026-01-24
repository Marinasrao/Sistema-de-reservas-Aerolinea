package com.aerolinea.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
public class RecommendationRequestDTO {

    @NotBlank(message = "El título es obligatorio.")
    private String title;

    private String description;

    private String origin;
    private String destination;

    private String departureDate;
    private String returnDate;

    @Min(value = 0, message = "El precio no puede ser negativo.")
    private Double price;

    private String shortDescription;
    private String flightType;
    private String airport;

    @Min(value = 0, message = "El porcentaje de descuento no puede ser negativo.")
    private Double discountPercent;

    @NotNull(message = "Debe seleccionar una categoría.")
    private Long categoryId;
}
