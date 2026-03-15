package com.aerolinea.controller;

import com.aerolinea.dto.CategoryEditorialDTO;
import com.aerolinea.entity.Category;
import com.aerolinea.entity.CategoryPromo;
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

    @GetMapping("/editorial")
    public ResponseEntity<List<CategoryEditorialDTO>> getEditorialByCategories(
            @RequestParam List<Long> ids
    ) {
        return ResponseEntity.ok(
                service.getEditorialByCategories(ids)
        );

    }

    @PostMapping(
            value = "/admin/{id}/promos"

    )
    public ResponseEntity<?> saveCategoryPromos(
            @PathVariable Long id,
            @RequestParam("promoTexts") String[] promoTexts,
            @RequestParam("images") MultipartFile[] images
    ) {
        try {
            service.saveCategoryPromos(id, promoTexts, images);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al guardar promociones: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/promos")
    public ResponseEntity<List<CategoryPromo>> getCategoryPromos(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.getCategoryPromos(id));
    }




}
