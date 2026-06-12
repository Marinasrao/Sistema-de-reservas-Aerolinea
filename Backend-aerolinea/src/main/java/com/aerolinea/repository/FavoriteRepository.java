package com.aerolinea.repository;

import com.aerolinea.entity.Favorite;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    Optional<Favorite> findByUserAndRecommendation(User user, Recommendation recommendation);

    boolean existsByUserAndRecommendation(User user, Recommendation recommendation);

    void deleteByUserAndRecommendation(User user, Recommendation recommendation);
}