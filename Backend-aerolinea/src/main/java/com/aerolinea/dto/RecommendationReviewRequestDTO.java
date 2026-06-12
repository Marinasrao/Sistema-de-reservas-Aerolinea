package com.aerolinea.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecommendationReviewRequestDTO {

    private Integer rating;

    private String comment;
}
