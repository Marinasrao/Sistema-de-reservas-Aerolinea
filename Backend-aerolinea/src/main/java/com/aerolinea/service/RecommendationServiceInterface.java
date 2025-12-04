package com.aerolinea.service;

import com.aerolinea.entity.Recommendation;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;
import com.aerolinea.entity.Recommendation;
import java.io.IOException;
import java.util.List;

public interface RecommendationServiceInterface {
    Recommendation saveRecommendation(
            Recommendation recommendation,
            MultipartFile mainImage,
            MultipartFile image1,
            MultipartFile image2,
            MultipartFile image3,
            MultipartFile image4
    ) throws IOException;

    List<Recommendation> getRandomRecommendations(int count);

    Recommendation findById(Long id);

    void deleteById(Long id);

    Recommendation updateRecommendation(Long id, Recommendation updatedData, MultipartFile newImage);

    List<Recommendation> getAllRecommendations();
}
