package com.aerolinea.controller;

import com.aerolinea.entity.Characteristic;
import com.aerolinea.service.CharacteristicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/characteristics")
public class AdminCharacteristicController {

    private final CharacteristicService characteristicService;

    public AdminCharacteristicController(CharacteristicService characteristicService) {
        this.characteristicService = characteristicService;
    }

    @GetMapping
    public List<Characteristic> getAll() {
        return characteristicService.getAll();
    }

    @PostMapping
    public Characteristic create(@RequestBody Characteristic characteristic) {
        return characteristicService.create(characteristic);
    }

    @PutMapping("/{id}")
    public Characteristic update(
            @PathVariable Long id,
            @RequestBody Characteristic characteristic
    ) {
        return characteristicService.update(id, characteristic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        characteristicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
