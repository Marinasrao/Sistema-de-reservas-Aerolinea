package com.aerolinea.mapper;

import com.aerolinea.dto.RecommendationRequestDTO;
import com.aerolinea.dto.RecommendationResponseDTO;
import com.aerolinea.dto.FlightResponseDTO;
import com.aerolinea.entity.Category;
import com.aerolinea.entity.Recommendation;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class RecommendationMapper {

    public Recommendation toEntity(RecommendationRequestDTO dto, Category category) {
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

        r.setCategory(category);

        return r;
    }

    public RecommendationResponseDTO toDTO(Recommendation r) {
        RecommendationResponseDTO dto = new RecommendationResponseDTO();

        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setOrigin(r.getOrigin());
        dto.setDestination(r.getDestination());
        dto.setDepartureDate(r.getDepartureDate());
        dto.setReturnDate(r.getReturnDate());
        dto.setPrice(r.getPrice());
        dto.setImageUrl(r.getImageUrl());
        dto.setShortDescription(r.getShortDescription());
        dto.setFlightType(r.getFlightType());
        dto.setAirport(r.getAirport());
        dto.setDiscountPercent(r.getDiscountPercent());
        dto.setLongDescription(r.getLongDescription());
        dto.setMainImage(r.getMainImage());
        dto.setImage1(r.getImage1());
        dto.setImage2(r.getImage2());
        dto.setImage3(r.getImage3());
        dto.setImage4(r.getImage4());

        if (r.getCategory() != null) {
            dto.setCategoryId(r.getCategory().getId());
            dto.setCategoryName(r.getCategory().getTitle());
        }

        if (r.getFlights() != null) {
            dto.setFlights(
                    r.getFlights().stream()
                            .map(f -> {
                                FlightResponseDTO fd = new FlightResponseDTO();
                                fd.setId(f.getId());
                                fd.setFlightNumber(f.getFlightNumber());
                                fd.setOrigin(f.getOrigin());
                                fd.setDestination(f.getDestination());
                                fd.setDepartureDate(f.getDepartureDate());
                                fd.setDepartureTime(f.getDepartureTime());
                                fd.setArrivalDate(f.getArrivalDate());
                                fd.setArrivalTime(f.getArrivalTime());
                                fd.setPrice(f.getPrice());
                                fd.setEconomySeats(f.getEconomySeats());
                                fd.setBusinessSeats(f.getBusinessSeats());
                                fd.setFirstSeats(f.getFirstSeats());
                                fd.setAirline(f.getAirline());
                                fd.setAircraftType(f.getAircraftType());
                                fd.setFlightStatus(f.getFlightStatus());
                                fd.setRecommendationId(
                                        f.getRecommendation() != null ? f.getRecommendation().getId() : null
                                );
                                return fd;
                            })
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}
