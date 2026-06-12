package com.aerolinea.dto;

import com.aerolinea.entity.RecommendationReview;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RecommendationReviewResponseDTO {

    private Long id;
    private Long recommendationId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RecommendationReviewResponseDTO fromEntity(RecommendationReview review) {
        String firstName = review.getUser().getFirstName() != null
                ? review.getUser().getFirstName()
                : "";

        String lastName = review.getUser().getLastName() != null
                ? review.getUser().getLastName()
                : "";

        String fullName = (firstName + " " + lastName).trim();

        if (fullName.isBlank()) {
            fullName = "Usuario FlightBooking";
        }

        return RecommendationReviewResponseDTO.builder()
                .id(review.getId())
                .recommendationId(review.getRecommendation().getId())
                .userId(review.getUser().getId())
                .userName(fullName)
                .userEmail(review.getUser().getEmail())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}