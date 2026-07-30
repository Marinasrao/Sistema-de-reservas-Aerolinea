package com.aerolinea.service;

import com.aerolinea.entity.City;
import com.aerolinea.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CityService {

    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public List<City> getActiveCities() {
        return cityRepository.findByActiveTrueOrderByNameAsc();
    }

    public List<City> getAllCities() {
        return cityRepository.findAllByOrderByNameAsc();
    }

    public City getCityById(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ciudad no encontrada."));
    }

    @Transactional
    public City createCity(City city) {
        normalizeCity(city);

        if (city.getName() == null || city.getName().isBlank()) {
            throw new RuntimeException("El nombre de la ciudad es obligatorio.");
        }

        if (cityRepository.existsByNameIgnoreCase(city.getName())) {
            throw new RuntimeException("La ciudad ya existe.");
        }

        city.setId(null);
        city.setActive(true);

        return cityRepository.save(city);
    }

    @Transactional
    public City updateCity(Long id, City cityData) {
        City existingCity = getCityById(id);

        normalizeCity(cityData);

        if (cityData.getName() == null || cityData.getName().isBlank()) {
            throw new RuntimeException("El nombre de la ciudad es obligatorio.");
        }

        cityRepository.findByNameIgnoreCase(cityData.getName())
                .filter(city -> !city.getId().equals(id))
                .ifPresent(city -> {
                    throw new RuntimeException("Ya existe otra ciudad con ese nombre.");
                });

        existingCity.setName(cityData.getName());
        existingCity.setCountry(cityData.getCountry());
        existingCity.setAirportCode(cityData.getAirportCode());

        return cityRepository.save(existingCity);
    }

    @Transactional
    public City toggleCityStatus(Long id) {
        City city = getCityById(id);
        city.setActive(!city.isActive());

        return cityRepository.save(city);
    }

    private void normalizeCity(City city) {
        if (city.getName() != null) {
            city.setName(city.getName().trim());
        }

        if (city.getCountry() != null) {
            String country = city.getCountry().trim();
            city.setCountry(country.isEmpty() ? null : country);
        }

        if (city.getAirportCode() != null) {
            String airportCode = city.getAirportCode().trim().toUpperCase();
            city.setAirportCode(airportCode.isEmpty() ? null : airportCode);
        }
    }
}