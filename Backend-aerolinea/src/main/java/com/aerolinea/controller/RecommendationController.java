package com.aerolinea.controller;

import com.aerolinea.entity.Recommendation;
import com.aerolinea.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;


    @GetMapping
    public List<Recommendation> getAllRecommendations() {
        return recommendationService.getAllRecommendations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recommendation> getRecommendationById(@PathVariable Long id) {
        Recommendation recommendation = recommendationService.getRecommendationById(id);
        if (recommendation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendation);
    }

    @PostMapping
    public ResponseEntity<Recommendation> createRecommendation(
            @RequestPart("recommendation") String recommendationJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            Recommendation created = recommendationService.saveRecommendation(recommendationJson, image, null);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recommendation> updateRecommendation(
            @PathVariable Long id,
            @RequestPart("recommendation") String recommendationJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            Recommendation updated = recommendationService.updateRecommendation(id, recommendationJson, image, null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/details")
    public ResponseEntity<String> saveRecommendationDetails(
            @PathVariable Long id,
            @RequestParam(value = "longDescription", required = false) String longDescription,
            @RequestParam(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3,
            @RequestParam(value = "image4", required = false) MultipartFile image4
    ) {
        try {
            recommendationService.saveRecommendationDetails(id, longDescription, mainImage, image1, image2, image3, image4);
            return ResponseEntity.ok("Detalles guardados");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar detalles");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long id) {
        try {
            recommendationService.deleteRecommendation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/random")
    public ResponseEntity<List<Recommendation>> getRandomRecommendations() {
        try {
            List<Recommendation> randomRecommendations = recommendationService.getRandomRecommendations(10);
            return ResponseEntity.ok(randomRecommendations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    @GetMapping("/auto-assign-categories")
    public ResponseEntity<String> autoAssignCategories() {
        try {
            int updated = recommendationService.autoAssignCategoriesToRecommendations();
            return ResponseEntity.ok("Recomendaciones categorizadas automáticamente: " + updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al asignar categorías automáticamente");
        }
    }
    @GetMapping("/debug/db")
    public Map<String, Object> debugDb(javax.sql.DataSource dataSource) throws Exception {
        Map<String, Object> info = new HashMap<>();
        try (var conn = dataSource.getConnection();
             var st = conn.createStatement();
             var rs = st.executeQuery("SELECT DATABASE()")) {

            if (rs.next()) {
                info.put("database", rs.getString(1));
            }
        }
        return info;
    }


}
