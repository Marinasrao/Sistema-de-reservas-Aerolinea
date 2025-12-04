package com.aerolinea.service;

import com.aerolinea.entity.Category;
import com.aerolinea.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private static final String UPLOAD_DIR = "C:/Users/Usuario/Desktop/Proyecto Aerolinea/uploads/categories";

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public void createCategory(String title, String promoText, MultipartFile image) throws IOException {
        Category category = new Category();
        category.setTitle(title);
        category.setPromoText(promoText);

        if (image != null && !image.isEmpty()) {
            String imageName = saveImage(image);
            category.setImage(imageName);
        }

        categoryRepository.save(category);
    }

    public void updateCategory(Long id, String title, String promoText, MultipartFile image) throws IOException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        category.setTitle(title);
        category.setPromoText(promoText);

        if (image != null && !image.isEmpty()) {
            // Borrar imagen anterior
            if (category.getImage() != null) {
                deleteImageFile(category.getImage());
            }
            // Guardar nueva
            String imageName = saveImage(image);
            category.setImage(imageName);
        }

        categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        // Borrar imagen asociada si existe
        if (category.getImage() != null) {
            deleteImageFile(category.getImage());
        }

        categoryRepository.deleteById(id);
    }

    private String saveImage(MultipartFile file) throws IOException {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;

        File dest = new File(dir, filename);
        file.transferTo(dest);

        // Generar URL completa accesible desde el navegador
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return baseUrl + "/uploads/categories/" + filename;
    }

    private void deleteImageFile(String imagePath) {
        try {
            // Extraer solo el nombre del archivo de la URL completa
            String filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            File file = new File(UPLOAD_DIR, filename);
            if (file.exists()) {
                Files.delete(file.toPath());
            }
        } catch (IOException e) {
            System.err.println("⚠️ No se pudo eliminar la imagen: " + imagePath);
        }
    }


    private String getExtension(String originalName) {
        if (originalName == null) return "";
        int dotIndex = originalName.lastIndexOf('.');
        return (dotIndex >= 0) ? originalName.substring(dotIndex + 1) : "";
    }
}
