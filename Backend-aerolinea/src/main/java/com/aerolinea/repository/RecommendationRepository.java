
package com.aerolinea.repository;

import com.aerolinea.entity.Recommendation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import com.aerolinea.dto.RecommendationHomeDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    @EntityGraph(attributePaths = "flights")
    Optional<Recommendation> findWithFlightsById(Long id);


    @Query("""
    SELECT new com.aerolinea.dto.RecommendationHomeDTO(
        r.id,
        r.title,
        r.shortDescription,
        r.mainImage,
        r.price,
        r.departureDate
    )
    FROM Recommendation r
    ORDER BY RAND()
""")
    List<RecommendationHomeDTO> findRandomForHome(Pageable pageable);


    @Query("""
    SELECT DISTINCT new com.aerolinea.dto.RecommendationHomeDTO(
        r.id,
        r.title,
        r.shortDescription,
        r.mainImage,
        r.price,
        r.departureDate
    )
    FROM Recommendation r
    JOIN r.categories c
    WHERE c.id = :categoryId
    ORDER BY r.id DESC
""")
    List<RecommendationHomeDTO> findEditorialByCategory(
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );



}
