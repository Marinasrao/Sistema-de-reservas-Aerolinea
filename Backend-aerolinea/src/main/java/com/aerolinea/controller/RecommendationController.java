package com.aerolinea.controller;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.service.RecommendationService;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aerolinea.dto.RecommendationWithFlightsDTO;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    @Autowired
    private RecommendationService recommendationService;

    //Guarda detalles de recomendación (descripción larga + 5 imágenes)

    @PostMapping(value = "/{id}/details", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveRecommendationDetails(
            @PathVariable Long id,

            @RequestParam(value = "longDescription", required = false) String longDescription,
            @RequestParam(value = "long_description", required = false) String long_description,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "flightType", required = false) String flightType,

            // archivos
            @RequestParam(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3,
            @RequestParam(value = "image4", required = false) MultipartFile image4

            ) {
        final String ld = (longDescription != null && !longDescription.isBlank())
                ? longDescription
                : (long_description != null ? long_description : null);

        try {
            recommendationService.saveRecommendationDetails(
                    id, ld, shortDescription, flightType, mainImage, image1, image2, image3, image4
            );
            return ResponseEntity.ok(Collections.singletonMap("message", "¡Detalles guardados con éxito!"));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            return ResponseEntity.status(413).body(Collections.singletonMap("message", "Archivo demasiado grande"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "La descripción es demasiado larga"));
        } catch (Exception e) {
            logger.error("Error al guardar detalles para id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("message", "Error al guardar los detalles."));
        }
    }

    //  Edita recomendación (título + imagen principal)
    @PutMapping(value = "/edit/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Recommendation> updateRecommendation(
            @PathVariable Long id,
            @RequestPart("recommendation") String recommendationJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Recommendation updatedData = mapper.readValue(recommendationJson, Recommendation.class);
            Recommendation updated = recommendationService.updateRecommendation(id, updatedData, image);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("❌ Error al editar recomendación", e);
            return ResponseEntity.badRequest().build();
        }

    }

    @PostMapping(value = "/add", consumes = {"multipart/form-data"})
    public ResponseEntity<Recommendation> addRecommendation(
            @RequestParam("recommendation") String recommendationJson,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Recommendation recommendation = mapper.readValue(recommendationJson, Recommendation.class);

            Recommendation saved = recommendationService.saveRecommendation(recommendation, image);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("❌ Error al guardar recomendación", e);
            return ResponseEntity.status(500).build();
        }
    }


    //  todas las recomendaciones
    @GetMapping
    public ResponseEntity<List<Recommendation>> getAllRecommendations() {
        List<Recommendation> all = recommendationService.getAllRecommendations();
        return ResponseEntity.ok(all);
    }

    // recomendaciones aleatorias
    @GetMapping("/random")
    public ResponseEntity<List<Recommendation>> getRandomRecommendations() {
        List<Recommendation> randomRecommendations = recommendationService.getRandomRecommendations(10);
        return ResponseEntity.ok(randomRecommendations);
    }

    // Eliminar una recomendación
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long id) {
        Recommendation recommendation = recommendationService.findById(id);
        if (recommendation == null) {
            return ResponseEntity.notFound().build();
        }
        recommendationService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // recomendación por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecommendationById(@PathVariable Long id) {
        Recommendation r = recommendationService.findById(id);
        if (r == null) return ResponseEntity.notFound().build();

        Map<String, Object> data = new HashMap<>();
        data.put("id", r.getId());
        data.put("title", r.getTitle());
        data.put("description", r.getDescription());
        data.put("origin", r.getOrigin());
        data.put("destination", r.getDestination());
        data.put("departureDate", r.getDepartureDate());
        data.put("returnDate", r.getReturnDate());
        data.put("price", r.getPrice());
        data.put("imageUrl", r.getImageUrl());
        data.put("shortDescription", r.getShortDescription());
        data.put("flightType", r.getFlightType());
        data.put("airport", r.getAirport());
        data.put("discountPercent", r.getDiscountPercent());
        data.put("longDescription", r.getLongDescription());
        data.put("mainImage", r.getMainImage());
        data.put("image1", r.getImage1());
        data.put("image2", r.getImage2());
        data.put("image3", r.getImage3());
        data.put("image4", r.getImage4());

        return ResponseEntity.ok(data);
    }


    // Elimina detalles de recomendación (galería + descripción larga)
    @DeleteMapping("/{id}/details")
    public ResponseEntity<?> deleteRecommendationDetails(@PathVariable Long id) {
        try {
            recommendationService.deleteDetailsById(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Detalles eliminados correctamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No se pudieron eliminar los detalles."));
        }
    }

    @PostMapping("/admin/backfill-card-thumbs")

    public ResponseEntity<?> backfillCardThumbs() {
        int updated = recommendationService.backfillCardThumbnails();
        return ResponseEntity.ok(Collections.singletonMap("updated", updated));
    }

    @GetMapping("/{id}/with-flights")
    public ResponseEntity<?> getRecommendationWithFlights(@PathVariable Long id) {
        try {
            RecommendationWithFlightsDTO dto = recommendationService.findByIdWithFlightsDTO(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            // el ID no existe
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Collections.singletonMap("message", "Error al traer la recomendación con vuelos")
            );
        }
    }
    @PostMapping("/admin/autofix-origin-destination")
    public ResponseEntity<?> autofixOD() {
        var r = recommendationService.autofixOriginDestinationFromTitle();
        return ResponseEntity.ok(r);
    }


}