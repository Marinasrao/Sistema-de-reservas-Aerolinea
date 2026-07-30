package com.aerolinea.repository;

import com.aerolinea.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findAllByOrderByNameAsc();

    List<City> findByActiveTrueOrderByNameAsc();

    Optional<City> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}