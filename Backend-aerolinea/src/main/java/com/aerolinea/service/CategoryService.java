package com.aerolinea.service;

import com.aerolinea.dto.CategoryEditorialDTO;
import com.aerolinea.dto.RecommendationHomeDTO;
import com.aerolinea.entity.Category;
import com.aerolinea.entity.CategoryPromo;
import com.aerolinea.repository.CategoryRepository;
import com.aerolinea.repository.CategoryPromoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final RecommendationService recommendationService;
    private final CategoryPromoRepository categoryPromoRepository;

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + "/uploads/categories";


    public CategoryService(
            CategoryRepository categoryRepository,
            RecommendationService recommendationService,
            CategoryPromoRepository categoryPromoRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.recommendationService = recommendationService;
        this.categoryPromoRepository = categoryPromoRepository;
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public void createCategory(
            String title,
            String promoText,
            MultipartFile image
    ) throws IOException {

        Category category = new Category();
        category.setTitle(title);
        category.setPromoText(promoText);

        if (image != null && !image.isEmpty()) {
            String imageName = saveImage(image);
            category.setImage(imageName);
        }

        categoryRepository.save(category);
    }

    public void updateCategory(
            Long id,
            String title,
            String promoText,
            MultipartFile image
    ) throws IOException {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoría no encontrada"));

        category.setTitle(title);
        category.setPromoText(promoText);

        if (image != null && !image.isEmpty()) {
            if (category.getImage() != null) {
                deleteImageFile(category.getImage());
            }
            String imageName = saveImage(image);
            category.setImage(imageName);
        }

        categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoría no encontrada"));

        if (category.getImage() != null) {
            deleteImageFile(category.getImage());
        }

        categoryRepository.deleteById(id);
    }

    @Transactional
    public void saveCategoryPromos(
            Long categoryId,
            String[] promoTexts,
            MultipartFile[] images
    ) throws IOException {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Categoría no encontrada"));


        categoryPromoRepository.deleteByCategoryId(categoryId);

        if (promoTexts == null || promoTexts.length == 0) {
            return;
        }

        for (int i = 0; i < promoTexts.length; i++) {

            String text = promoTexts[i] != null ? promoTexts[i].trim() : "";

            MultipartFile imageFile =
                    (images != null && images.length > i) ? images[i] : null;


            if ((imageFile == null || imageFile.isEmpty()) && text.isBlank()) {
                continue;
            }

            CategoryPromo promo = new CategoryPromo();
            promo.setCategory(category);
            promo.setPromoText(text);
            promo.setPosition(i + 1);

            if (imageFile != null && !imageFile.isEmpty()) {
                String imageName = saveImage(imageFile);
                promo.setImage(imageName);
            }

            categoryPromoRepository.save(promo);
        }
    }


    public List<CategoryPromo> getCategoryPromos(Long categoryId) {
        return categoryPromoRepository
                .findByCategoryIdOrderByPositionAsc(categoryId);
    }

    public List<CategoryEditorialDTO> getEditorialByCategories(
            List<Long> ids
    ) {
        List<Category> categories = categoryRepository.findAllById(ids);
        List<CategoryEditorialDTO> result = new ArrayList<>();

        for (Category category : categories) {

            List<CategoryPromo> promos =
                    categoryPromoRepository
                            .findByCategoryIdOrderByPositionAsc(category.getId());

            if (promos.isEmpty()) {

                continue;
            }

            List<RecommendationHomeDTO> recs = promos.stream()
                    .map(promo -> new RecommendationHomeDTO(
                            promo.getId(),
                            promo.getPromoText() != null
                                    ? promo.getPromoText()
                                    : "Destino destacado",
                            null,
                            promo.getImage(),
                            null,
                            null
                    ))
                    .toList();

            result.add(
                    new CategoryEditorialDTO(
                            category.getId(),
                            category.getTitle(),
                            recs
                    )
            );
        }

        return result;
    }


    private String saveImage(MultipartFile file) throws IOException {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;

        File dest = new File(dir, filename);
        file.transferTo(dest);

        return filename;
    }

    private void deleteImageFile(String imagePath) {
        try {
            File file = new File(UPLOAD_DIR, imagePath);
            if (file.exists()) {
                Files.delete(file.toPath());
            }
        } catch (IOException e) {
            System.err.println(
                    "⚠️ No se pudo eliminar la imagen: " + imagePath
            );
        }
    }

    private String getExtension(String originalName) {
        if (originalName == null) return "";
        int dotIndex = originalName.lastIndexOf('.');
        return dotIndex >= 0
                ? originalName.substring(dotIndex + 1)
                : "";
    }
}
