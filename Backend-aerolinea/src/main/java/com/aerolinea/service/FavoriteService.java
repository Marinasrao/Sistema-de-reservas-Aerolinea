package com.aerolinea.service;

import com.aerolinea.entity.Favorite;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.entity.User;
import com.aerolinea.repository.FavoriteRepository;
import com.aerolinea.repository.RecommendationRepository;
import com.aerolinea.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RecommendationRepository recommendationRepository;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            RecommendationRepository recommendationRepository
    ) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public List<Recommendation> getFavorites(Principal principal) {
        User user = getAuthenticatedUser(principal);

        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(Favorite::getRecommendation)
                .toList();
    }

    @Transactional
    public List<Recommendation> addFavorite(Long recommendationId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        Recommendation recommendation = getRecommendation(recommendationId);

        boolean alreadyExists = favoriteRepository.existsByUserAndRecommendation(user, recommendation);

        if (!alreadyExists) {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .recommendation(recommendation)
                    .build();

            favoriteRepository.save(favorite);
        }

        return getFavorites(principal);
    }

    @Transactional
    public List<Recommendation> removeFavorite(Long recommendationId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        Recommendation recommendation = getRecommendation(recommendationId);

        favoriteRepository.deleteByUserAndRecommendation(user, recommendation);

        return getFavorites(principal);
    }

    public boolean isFavorite(Long recommendationId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        Recommendation recommendation = getRecommendation(recommendationId);

        return favoriteRepository.existsByUserAndRecommendation(user, recommendation);
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private Recommendation getRecommendation(Long recommendationId) {
        return recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recomendación no encontrada"));
    }
}
