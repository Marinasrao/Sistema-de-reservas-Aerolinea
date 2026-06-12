package com.aerolinea.service;

import com.aerolinea.dto.RecommendationReviewRequestDTO;
import com.aerolinea.dto.RecommendationReviewResponseDTO;
import com.aerolinea.dto.RecommendationReviewSummaryDTO;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.entity.RecommendationReview;
import com.aerolinea.entity.User;
import com.aerolinea.repository.RecommendationRepository;
import com.aerolinea.repository.RecommendationReviewRepository;
import com.aerolinea.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationReviewService {

    private final RecommendationReviewRepository reviewRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;

    public RecommendationReviewService(
            RecommendationReviewRepository reviewRepository,
            RecommendationRepository recommendationRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
    }

    public List<RecommendationReviewResponseDTO> getReviewsByRecommendation(Long recommendationId) {
        return reviewRepository.findByRecommendationIdOrderByCreatedAtDesc(recommendationId)
                .stream()
                .map(RecommendationReviewResponseDTO::fromEntity)
                .toList();
    }

    public RecommendationReviewSummaryDTO getSummaryByRecommendation(Long recommendationId) {
        Double average = reviewRepository.getAverageRatingByRecommendationId(recommendationId);
        Long total = reviewRepository.countByRecommendationId(recommendationId);

        return new RecommendationReviewSummaryDTO(
                average != null ? average : 0.0,
                total != null ? total : 0L
        );
    }

    public RecommendationReviewResponseDTO createOrUpdateReview(
            Long recommendationId,
            RecommendationReviewRequestDTO request,
            String userEmail
    ) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("La puntuación debe estar entre 1 y 5.");
        }

        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("No se encontró la recomendación."));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("No se encontró el usuario autenticado."));

        RecommendationReview review = reviewRepository
                .findByRecommendationIdAndUserId(recommendationId, user.getId())
                .orElseGet(() ->
                        RecommendationReview.builder()
                                .recommendation(recommendation)
                                .user(user)
                                .build()
                );

        review.setRating(request.getRating());
        review.setComment(
                request.getComment() != null
                        ? request.getComment().trim()
                        : ""
        );

        RecommendationReview saved = reviewRepository.save(review);

        return RecommendationReviewResponseDTO.fromEntity(saved);
    }
}