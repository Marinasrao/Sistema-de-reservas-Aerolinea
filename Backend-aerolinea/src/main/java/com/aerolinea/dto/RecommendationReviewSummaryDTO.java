package com.aerolinea.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RecommendationReviewSummaryDTO {

    private Double averageRating;

    private Long totalReviews;
}
