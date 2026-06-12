package com.aerolinea.repository;

import com.aerolinea.entity.RecommendationReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RecommendationReviewRepository extends JpaRepository<RecommendationReview, Long> {

    List<RecommendationReview> findByRecommendationIdOrderByCreatedAtDesc(Long recommendationId);

    Optional<RecommendationReview> findByRecommendationIdAndUserId(Long recommendationId, Long userId);

    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM RecommendationReview r
            WHERE r.recommendation.id = :recommendationId
            """)
    Double getAverageRatingByRecommendationId(Long recommendationId);

    Long countByRecommendationId(Long recommendationId);
}
