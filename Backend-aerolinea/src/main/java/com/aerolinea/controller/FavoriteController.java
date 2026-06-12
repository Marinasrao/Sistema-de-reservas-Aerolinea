package com.aerolinea.controller;

import com.aerolinea.entity.Recommendation;
import com.aerolinea.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<List<Recommendation>> getFavorites(Principal principal) {
        return ResponseEntity.ok(favoriteService.getFavorites(principal));
    }

    @PostMapping("/{recommendationId}")
    public ResponseEntity<List<Recommendation>> addFavorite(
            @PathVariable Long recommendationId,
            Principal principal
    ) {
        return ResponseEntity.ok(favoriteService.addFavorite(recommendationId, principal));
    }

    @DeleteMapping("/{recommendationId}")
    public ResponseEntity<List<Recommendation>> removeFavorite(
            @PathVariable Long recommendationId,
            Principal principal
    ) {
        return ResponseEntity.ok(favoriteService.removeFavorite(recommendationId, principal));
    }

    @GetMapping("/check/{recommendationId}")
    public ResponseEntity<Map<String, Boolean>> isFavorite(
            @PathVariable Long recommendationId,
            Principal principal
    ) {
        return ResponseEntity.ok(Map.of("favorite", favoriteService.isFavorite(recommendationId, principal)));
    }
}