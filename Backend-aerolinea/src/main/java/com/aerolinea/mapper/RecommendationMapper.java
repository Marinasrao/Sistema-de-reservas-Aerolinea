package com.aerolinea.mapper;

import com.aerolinea.dto.RecommendationRequestDTO;
import com.aerolinea.dto.FlightResponseDTO;
import com.aerolinea.entity.Category;
import com.aerolinea.entity.Recommendation;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RecommendationMapper {

    /* =======================
       DTO → ENTITY
       ======================= */
    public Recommendation toEntity(
            RecommendationRequestDTO dto,
            Set<Category> categories
    ) {
        Recommendation r = new Recommendation();

        r.setTitle(dto.getTitle());
        r.setDescription(dto.getDescription());
        r.setOrigin(dto.getOrigin());
        r.setDestination(dto.getDestination());
        r.setDepartureDate(dto.getDepartureDate());
        r.setReturnDate(dto.getReturnDate());
        r.setPrice(dto.getPrice());
        r.setShortDescription(dto.getShortDescription());
        r.setFlightType(dto.getFlightType());
        r.setAirport(dto.getAirport());
        r.setDiscountPercent(dto.getDiscountPercent());

        r.setCategories(categories);

        return r;
    }


}
