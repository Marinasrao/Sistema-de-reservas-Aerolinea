package com.aerolinea.mapper;

import com.aerolinea.dto.FlightRequestDTO;
import com.aerolinea.dto.FlightResponseDTO;
import com.aerolinea.entity.Category;
import com.aerolinea.entity.Flight;
import com.aerolinea.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FlightMapper {

    @Autowired
    private CategoryRepository categoryRepository;

    public FlightResponseDTO toDTO(Flight flight) {
        if (flight == null) {
            return null;
        }

        FlightResponseDTO dto = new FlightResponseDTO();

        dto.setId(flight.getId());
        dto.setFlightNumber(flight.getFlightNumber());
        dto.setOrigin(flight.getOrigin());
        dto.setDestination(flight.getDestination());

        dto.setDepartureDate(flight.getDepartureDate());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalDate(flight.getArrivalDate());
        dto.setArrivalTime(flight.getArrivalTime());

        dto.setPrice(flight.getPrice());

        dto.setSeatsAvailable(flight.getSeatsAvailable());
        dto.setEconomySeats(flight.getEconomySeats());
        dto.setBusinessSeats(flight.getBusinessSeats());
        dto.setFirstSeats(flight.getFirstSeats());

        dto.setAirline(flight.getAirline());
        dto.setAircraftType(flight.getAircraftType());
        dto.setFlightStatus(flight.getFlightStatus());

        if (flight.getRecommendation() != null) {
            dto.setRecommendationId(flight.getRecommendation().getId());
        }

        if (flight.getCategory() != null) {
            dto.setCategoryId(flight.getCategory().getId());
            dto.setCategoryTitle(flight.getCategory().getTitle());
            dto.setCategoryImage(flight.getCategory().getImage());
            dto.setCategoryPromoText(flight.getCategory().getPromoText());
        }

        return dto;
    }

    public Flight toEntity(FlightRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Flight flight = new Flight();

        flight.setFlightNumber(dto.getFlightNumber());
        flight.setOrigin(dto.getOrigin());
        flight.setDestination(dto.getDestination());

        flight.setDepartureDate(dto.getDepartureDate());
        flight.setDepartureTime(dto.getDepartureTime());
        flight.setArrivalDate(dto.getArrivalDate());
        flight.setArrivalTime(dto.getArrivalTime());

        flight.setPrice(dto.getPrice());

        flight.setEconomySeats(dto.getEconomySeats());
        flight.setBusinessSeats(dto.getBusinessSeats());
        flight.setFirstSeats(dto.getFirstSeats());

        int totalCapacity =
                dto.getEconomySeats()
                        + dto.getBusinessSeats()
                        + dto.getFirstSeats();

        flight.setSeatsAvailable(totalCapacity);

        flight.setAirline(dto.getAirline());
        flight.setAircraftType(dto.getAircraftType());
        flight.setFlightStatus(dto.getFlightStatus());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

            flight.setCategory(category);
        }

        return flight;
    }
}