package com.aerolinea.repository;

import com.aerolinea.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {
}