package com.aerolinea.repository;

import com.aerolinea.entity.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    boolean existsByFlightNumberAndDepartureDateAndOriginAndDestination(
            String flightNumber,
            LocalDate departureDate,
            String origin,
            String destination
    );

    List<Flight> findByRecommendationId(Long recommendationId);

    List<Flight> findByDestinationIgnoreCaseAndDepartureDateBetween(
            String destination,
            LocalDate start,
            LocalDate end
    );

    Page<Flight> findByDestinationIgnoreCaseAndDepartureDateBetween(
            String destination,
            LocalDate start,
            LocalDate end,
            Pageable pageable
    );

    List<Flight> findByDestinationIgnoreCase(String destination);

    List<Flight> findByDescriptionContainingIgnoreCase(String text);

    @Query("select distinct f.destination from Flight f order by f.destination")
    List<String> findDistinctDestinations();

    @Query("""
            select f from Flight f
            where lower(f.destination) like lower(concat('%', :term, '%'))
               or lower(f.origin) like lower(concat('%', :term, '%'))
            order by f.destination, f.departureDate, f.departureTime
            """)
    List<Flight> searchFuzzy(@Param("term") String term);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Flight f where f.id = :id")
    Optional<Flight> findForUpdate(@Param("id") Long id);

    List<Flight> findByDestinationIgnoreCaseAndDepartureDateBetweenAndDepartureDateAfter(
            String destination,
            LocalDate start,
            LocalDate end,
            LocalDate now
    );

    List<Flight> findByDestinationIgnoreCaseAndDepartureDateGreaterThanEqual(
            String destination,
            LocalDate today
    );

    List<Flight> findByDepartureDateBefore(LocalDate date);

    void deleteByDepartureDateBefore(LocalDate date);

    List<Flight> findByOriginAndDestinationAndDepartureDateGreaterThanEqualOrderByDepartureDateAsc(
            String origin,
            String destination,
            LocalDate fromDate
    );

    List<Flight> findByOriginAndDestinationAndDepartureDate(
            String origin,
            String destination,
            LocalDate departureDate
    );

    @Query("SELECT DISTINCT f.origin FROM Flight f ORDER BY f.origin")
    List<String> findDistinctOrigins();

    @Query("""
            select f from Flight f
            where lower(f.origin) like lower(concat('%', :origin, '%'))
              and lower(f.destination) like lower(concat('%', :destination, '%'))
              and f.departureDate = :departureDate
            """)
    List<Flight> searchExactDate(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("departureDate") LocalDate departureDate
    );

    @Query("""
            select distinct f.departureDate
            from Flight f
            where f.origin = :origin
              and f.destination = :destination
              and f.departureDate >= :fromDate
            order by f.departureDate
            """)
    List<LocalDate> findAvailableDatesByRoute(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("fromDate") LocalDate fromDate
    );

    Page<Flight> findByCategory_IdIn(List<Long> categoryIds, Pageable pageable);

    @Query("""
            select f from Flight f
            where f.category.id in :categoryIds
            """)
    List<Flight> findAllByCategoryIds(
            @Param("categoryIds") List<Long> categoryIds
    );

    @Query("SELECT DISTINCT f.destination FROM Flight f WHERE f.origin = :origin")
    List<String> findDestinationsByOrigin(@Param("origin") String origin);

    /*
     * Vuelos reales disponibles para el calendario.
     * Solo se consideran los que estén programados.
     */
    @Query("""
            select f
            from Flight f
            where lower(f.origin) = lower(:origin)
              and lower(f.destination) = lower(:destination)
              and f.departureDate between :fromDate and :toDate
              and lower(coalesce(f.flightStatus, 'programado')) = 'programado'
            order by f.departureDate, f.departureTime
            """)
    List<Flight> findReservableFlightsByRouteAndDateRange(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    /*
     * Vuelos reales de una ruta para una fecha puntual.
     * Se usará para mostrar los horarios reales al seleccionar un día verde.
     */
    @Query("""
            select f
            from Flight f
            where lower(f.origin) = lower(:origin)
              and lower(f.destination) = lower(:destination)
              and f.departureDate = :date
              and lower(coalesce(f.flightStatus, 'programado')) = 'programado'
            order by f.departureTime
            """)
    List<Flight> findReservableFlightsByRouteAndDate(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("date") LocalDate date
    );
}




















































































































































