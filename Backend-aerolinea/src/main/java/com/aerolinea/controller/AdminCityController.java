package com.aerolinea.controller;

import com.aerolinea.entity.City;
import com.aerolinea.service.CityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cities")
public class AdminCityController {

    private final CityService cityService;

    public AdminCityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping
    public List<City> getAllCities() {
        return cityService.getAllCities();
    }

    @PostMapping
    public ResponseEntity<?> createCity(@RequestBody City city) {
        try {
            return ResponseEntity.ok(cityService.createCity(city));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCity(
            @PathVariable Long id,
            @RequestBody City city
    ) {
        try {
            return ResponseEntity.ok(cityService.updateCity(id, city));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleCityStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cityService.toggleCityStatus(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }
}