
package com.aerolinea.repository;

import com.aerolinea.entity.Recommendation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    @EntityGraph(attributePaths = "flights")
    Optional<Recommendation> findWithFlightsById(Long id);
}
