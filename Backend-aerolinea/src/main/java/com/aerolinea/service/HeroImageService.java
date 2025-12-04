package com.aerolinea.service;

import com.aerolinea.entity.HeroImage;
import com.aerolinea.repository.HeroImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class HeroImageService {

    private static final String HERO_UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/hero";

    @Autowired
    private HeroImageRepository repository;

    public List<HeroImage> getAll() {
        return repository.findAll();
    }

    public List<HeroImage> saveAll(List<MultipartFile> files, List<String> descriptions) throws IOException {
        // Borrar imágenes anteriores físicas y en base de datos
        deleteAll();

        // Crear carpeta si no existe
        File dir = new File(HERO_UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        List<HeroImage> saved = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;

            Path filePath = Paths.get(HERO_UPLOAD_DIR, uniqueFilename);
            file.transferTo(filePath.toFile());

            HeroImage img = HeroImage.builder()
                    .filename(uniqueFilename)
                    .description(descriptions.get(i))
                    .build();

            saved.add(img);
        }

        return repository.saveAll(saved);
    }

    public void deleteAll() {
        // Eliminar imágenes físicas del directorio /uploads/hero
        File folder = new File(HERO_UPLOAD_DIR);
        if (folder.exists() && folder.isDirectory()) {
            for (File file : folder.listFiles()) {
                file.delete();
            }
        }

        // Eliminar registros de la base de datos
        repository.deleteAll();
    }
}
