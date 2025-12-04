package com.aerolinea.controller;

import com.aerolinea.entity.HeroImage;
import com.aerolinea.service.HeroImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/hero")
@CrossOrigin(origins = "*")
public class HeroImageController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/hero";

    @Autowired
    private HeroImageService service;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadHeroImages(
            @RequestParam("images") List<MultipartFile> files,
            @RequestParam("descriptions") List<String> descriptions
    ) {
        try {
            //  1. Eliminar archivos físicos previos
            File folder = new File(UPLOAD_DIR);
            if (folder.exists()) {
                for (File file : folder.listFiles()) {
                    if (file.isFile()) {
                        file.delete();
                    }
                }
            }

            //  2. Eliminar registros previos de la base
            service.deleteAll();

            //  3. Guardar nuevos archivos + registros
            List<HeroImage> savedImages = service.saveAll(files, descriptions);

            return ResponseEntity.ok(savedImages);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al guardar imágenes: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<HeroImage>> getHeroImages() {
        return ResponseEntity.ok(service.getAll());
    }
}
