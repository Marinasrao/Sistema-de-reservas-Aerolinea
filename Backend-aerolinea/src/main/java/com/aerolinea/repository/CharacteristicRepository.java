package com.aerolinea.repository;

import com.aerolinea.entity.Characteristic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CharacteristicRepository extends JpaRepository<Characteristic, Long> {

    @Modifying
    @Query(
            value = "DELETE FROM category_characteristics WHERE characteristic_id = :id",
            nativeQuery = true
    )
    void deleteFromCategoryCharacteristics(@Param("id") Long id);
}

