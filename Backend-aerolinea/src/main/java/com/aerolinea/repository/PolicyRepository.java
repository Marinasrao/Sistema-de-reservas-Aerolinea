package com.aerolinea.repository;

import com.aerolinea.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    List<Policy> findByActiveTrueOrderByDisplayOrderAsc();

    List<Policy> findAllByOrderByDisplayOrderAsc();
}
