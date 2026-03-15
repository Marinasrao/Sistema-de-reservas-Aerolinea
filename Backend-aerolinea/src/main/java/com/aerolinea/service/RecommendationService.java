package com.aerolinea.service;

import com.aerolinea.entity.Category;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.repository.CategoryRepository;
import com.aerolinea.repository.RecommendationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.PageRequest;
import com.aerolinea.dto.RecommendationHomeDTO;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RecommendationService {

    private static final String IMAGE_UPLOAD_PATH = "uploads/recommendations";

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    public Recommendation getRecommendationById(Long id) {
        return recommendationRepository.findById(id).orElse(null);
    }

    public Recommendation saveRecommendation(String recommendationJson, MultipartFile image, Long categoryId) throws Exception {
        Recommendation recommendation = objectMapper.readValue(recommendationJson, Recommendation.class);

        if (image != null && !image.isEmpty()) {
            String imageName = saveImage(image);
            recommendation.setImageUrl(imageName);
        }

        return recommendationRepository.save(recommendation);
    }

    public Recommendation updateRecommendation(Long id, String recommendationJson, MultipartFile newImage, Long categoryId) throws Exception {
        Recommendation existing = recommendationRepository.findById(id).orElse(null);
        if (existing == null) {
            throw new IllegalArgumentException("Recommendation not found");
        }

        Recommendation updatedData = objectMapper.readValue(recommendationJson, Recommendation.class);
        existing.setTitle(updatedData.getTitle());
        existing.setAirport(updatedData.getAirport());
        existing.setDepartureDate(updatedData.getDepartureDate());
        existing.setPrice(updatedData.getPrice());
        existing.setDiscountPercent(updatedData.getDiscountPercent());

        if (newImage != null && !newImage.isEmpty()) {
            if (existing.getImageUrl() != null) {
                Path oldImagePath = Paths.get(System.getProperty("user.dir"), IMAGE_UPLOAD_PATH, existing.getImageUrl());
                Files.deleteIfExists(oldImagePath);
            }

            String imageName = saveImage(newImage);
            existing.setImageUrl(imageName);
        }

        return recommendationRepository.save(existing);
    }

    public void saveRecommendationDetails(
            Long id,
            String longDescription,
            MultipartFile mainImage,
            MultipartFile image1,
            MultipartFile image2,
            MultipartFile image3,
            MultipartFile image4
    ) throws Exception {
        Recommendation rec = recommendationRepository.findById(id).orElse(null);
        if (rec == null) throw new IllegalArgumentException("Recommendation not found");

        if (longDescription != null) rec.setLongDescription(longDescription);

        if (mainImage != null && !mainImage.isEmpty()) {
            rec.setMainImage(saveImage(mainImage));
        }

        if (image1 != null && !image1.isEmpty()) rec.setImage1(saveImage(image1));
        if (image2 != null && !image2.isEmpty()) rec.setImage2(saveImage(image2));
        if (image3 != null && !image3.isEmpty()) rec.setImage3(saveImage(image3));
        if (image4 != null && !image4.isEmpty()) rec.setImage4(saveImage(image4));

        recommendationRepository.save(rec);
    }

    public Recommendation findById(Long id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recomendación no encontrada con ID: " + id));
    }

    public void deleteRecommendation(Long id) {
        recommendationRepository.deleteById(id);
    }

    public List<Recommendation> getRandomRecommendations(int limit) {
        List<Recommendation> all = recommendationRepository.findAll();

        if (all.size() <= limit) {
            return all;
        }

        Collections.shuffle(all);
        return all.subList(0, limit);
    }



    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase()
                .replace("á","a")
                .replace("é","e")
                .replace("í","i")
                .replace("ó","o")
                .replace("ú","u");
    }

    private boolean containsKeyword(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }

    private String saveImage(MultipartFile file) throws Exception {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path imagePath = Paths.get(System.getProperty("user.dir"), IMAGE_UPLOAD_PATH);
        Files.createDirectories(imagePath);
        Path filePath = imagePath.resolve(filename);
        file.transferTo(filePath.toFile());
        return filename;
    }




    public List<RecommendationHomeDTO> getRandomForHome() {
        return recommendationRepository.findRandomForHome(
                PageRequest.of(0, 10)
        );
    }

    public List<RecommendationHomeDTO> getEditorialForCategory(Long categoryId) {
        return recommendationRepository.findEditorialByCategory(
                categoryId,
                PageRequest.of(0, 4)
        );
    }



}
