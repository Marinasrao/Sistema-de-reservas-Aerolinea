package com.aerolinea.mapper;

import com.aerolinea.dto.FlightRequestDTO;
import com.aerolinea.dto.FlightResponseDTO;
import com.aerolinea.entity.Flight;
import org.springframework.stereotype.Component;

@Component
public class FlightMapper {

    // --------------------- ENTITY → DTO ---------------------
    public FlightResponseDTO toDTO(Flight f) {
        if (f == null) return null;

        FlightResponseDTO dto = new FlightResponseDTO();

        dto.setId(f.getId());
        dto.setFlightNumber(f.getFlightNumber());
        dto.setOrigin(f.getOrigin());
        dto.setDestination(f.getDestination());

        dto.setDepartureDate(f.getDepartureDate());
        dto.setDepartureTime(f.getDepartureTime());
        dto.setArrivalDate(f.getArrivalDate());
        dto.setArrivalTime(f.getArrivalTime());

        dto.setPrice(f.getPrice());

        dto.setSeatsAvailable(f.getSeatsAvailable());
        dto.setEconomySeats(f.getEconomySeats());
        dto.setBusinessSeats(f.getBusinessSeats());
        dto.setFirstSeats(f.getFirstSeats());

        dto.setAirline(f.getAirline());
        dto.setAircraftType(f.getAircraftType());
        dto.setFlightStatus(f.getFlightStatus());

        dto.setImageUrls(f.getImageUrls());

        // Recomendación (solo ID)
        if (f.getRecommendation() != null) {
            dto.setRecommendationId(f.getRecommendation().getId());
        }

        // ---------------- CATEGORY ----------------
        if (f.getCategory() != null) {
            dto.setCategoryId(f.getCategory().getId());
            dto.setCategoryTitle(f.getCategory().getTitle());
            dto.setCategoryImage(f.getCategory().getImage());
            dto.setCategoryPromoText(f.getCategory().getPromoText());
        }

        return dto;
    }

    // --------------------- DTO → ENTITY ---------------------
    public Flight toEntity(FlightRequestDTO dto) {
        if (dto == null) return null;

        Flight f = new Flight();

        f.setFlightNumber(dto.getFlightNumber());
        f.setOrigin(dto.getOrigin());
        f.setDestination(dto.getDestination());

        f.setDepartureDate(dto.getDepartureDate());
        f.setDepartureTime(dto.getDepartureTime());
        f.setArrivalDate(dto.getArrivalDate());
        f.setArrivalTime(dto.getArrivalTime());

        f.setPrice(dto.getPrice());

        f.setSeatsAvailable(dto.getSeatsAvailable());
        f.setEconomySeats(dto.getEconomySeats());
        f.setBusinessSeats(dto.getBusinessSeats());
        f.setFirstSeats(dto.getFirstSeats());

        f.setAirline(dto.getAirline());
        f.setAircraftType(dto.getAircraftType());
        f.setFlightStatus(dto.getFlightStatus());

        return f;
    }
}

