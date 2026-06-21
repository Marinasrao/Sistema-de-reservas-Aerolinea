package com.aerolinea.repository;

import com.aerolinea.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    List<Passenger> findByFlight_Id(Long flightId);

    boolean existsByFlight_IdAndDocumentNumber(
            Long flightId,
            String documentNumber
    );

    boolean existsByFlight_IdAndSeatNumberIgnoreCase(
            Long flightId,
            String seatNumber
    );

    long countByFlight_Id(Long flightId);

    void deleteByFlight_Id(Long flightId);

    List<Passenger> findByFlight_IdAndFlightClassIgnoreCase(
            Long flightId,
            String flightClass
    );
    List<Passenger> findByFlight_IdAndFlightClass(
            Long flightId,
            String flightClass
    );
}