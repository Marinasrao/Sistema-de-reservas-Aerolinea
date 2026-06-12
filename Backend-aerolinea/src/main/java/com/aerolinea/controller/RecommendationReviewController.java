package com.aerolinea.controller;

import com.aerolinea.dto.RecommendationReviewRequestDTO;
import com.aerolinea.dto.RecommendationReviewResponseDTO;
import com.aerolinea.dto.RecommendationReviewSummaryDTO;
import com.aerolinea.service.RecommendationReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationReviewController {

    private final RecommendationReviewService reviewService;

    public RecommendationReviewController(RecommendationReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/recommendation/{recommendationId}")
    public ResponseEntity<List<RecommendationReviewResponseDTO>> getReviewsByRecommendation(
            @PathVariable Long recommendationId
    ) {
        return ResponseEntity.ok(
                reviewService.getReviewsByRecommendation(recommendationId)
        );
    }

    @GetMapping("/recommendation/{recommendationId}/summary")
    public ResponseEntity<RecommendationReviewSummaryDTO> getSummaryByRecommendation(
            @PathVariable Long recommendationId
    ) {
        return ResponseEntity.ok(
                reviewService.getSummaryByRecommendation(recommendationId)
        );
    }

    @PostMapping("/recommendation/{recommendationId}")
    public ResponseEntity<?> createOrUpdateReview(
            @PathVariable Long recommendationId,
            @RequestBody RecommendationReviewRequestDTO request,
            Authentication authentication
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body("Usuario no autenticado.");
            }

            RecommendationReviewResponseDTO savedReview =
                    reviewService.createOrUpdateReview(
                            recommendationId,
                            request,
                            authentication.getName()
                    );

            return ResponseEntity.ok(savedReview);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("No se pudo guardar la valoración.");
        }
    }
}