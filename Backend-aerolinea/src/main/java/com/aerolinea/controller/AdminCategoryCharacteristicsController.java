package com.aerolinea.controller;

import com.aerolinea.entity.Category;
import com.aerolinea.entity.Characteristic;
import com.aerolinea.repository.CategoryRepository;
import com.aerolinea.repository.CharacteristicRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryCharacteristicsController {

    private final CategoryRepository categoryRepository;
    private final CharacteristicRepository characteristicRepository;

    public AdminCategoryCharacteristicsController(
            CategoryRepository categoryRepository,
            CharacteristicRepository characteristicRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.characteristicRepository = characteristicRepository;
    }

    @GetMapping("/{id}/characteristics")
    public Set<Characteristic> getCharacteristics(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));

        return category.getCharacteristics();
    }

    @PostMapping("/{id}/characteristics")
    public Set<Characteristic> addCharacteristic(
            @PathVariable Long id,
            @RequestBody Characteristic characteristic
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));

        Characteristic saved = characteristicRepository.save(characteristic);

        category.getCharacteristics().add(saved);
        categoryRepository.save(category);

        return category.getCharacteristics();
    }

    @DeleteMapping("/{id}/characteristics/{characteristicId}")
    public Set<Characteristic> removeCharacteristic(
            @PathVariable Long id,
            @PathVariable Long characteristicId
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));

        Characteristic characteristic = characteristicRepository.findById(characteristicId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Characteristic not found"));

        category.getCharacteristics().remove(characteristic);
        categoryRepository.save(category);

        return category.getCharacteristics();
    }
    @PutMapping("/{id}/characteristics")
    public Set<Characteristic> updateCharacteristics(
            @PathVariable Long id,
            @RequestBody List<Long> characteristicIds
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));

        Set<Characteristic> chars = new HashSet<>(
                characteristicRepository.findAllById(characteristicIds)
        );

        category.setCharacteristics(chars);
        categoryRepository.save(category);

        return category.getCharacteristics();
    }

}

