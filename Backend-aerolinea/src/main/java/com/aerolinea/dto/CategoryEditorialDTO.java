package com.aerolinea.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CategoryEditorialDTO {

    private Long categoryId;
    private String categoryTitle;
    private List<RecommendationHomeDTO> recommendations;
}
