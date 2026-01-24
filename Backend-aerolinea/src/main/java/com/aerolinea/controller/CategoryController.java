package com.aerolinea.controller;

import com.aerolinea.entity.Category;
import com.aerolinea.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // ===================== PÚBLICO (HOME) =====================

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // ===================== ADMIN =====================

    @PostMapping(
            value = "/admin",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> createCategory(
            @RequestParam("title") String title,
            @RequestParam("promoText") String promoText,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            service.createCategory(title, promoText, image);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PutMapping(
            value = "/admin/{id}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("promoText") String promoText,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            service.updateCategory(id, title, promoText, image);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            service.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
