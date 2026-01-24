package com.aerolinea.dto;

public class RecommendationDto {
    private String title;
    private String description;
    private Long categoryId; // ID de la categoría seleccionada

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
