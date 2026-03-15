package com.aerolinea.repository;

import com.aerolinea.entity.CategoryPromo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryPromoRepository extends JpaRepository<CategoryPromo, Long> {

    List<CategoryPromo> findByCategoryIdOrderByPositionAsc(Long categoryId);

    void deleteByCategoryId(Long categoryId);
}
