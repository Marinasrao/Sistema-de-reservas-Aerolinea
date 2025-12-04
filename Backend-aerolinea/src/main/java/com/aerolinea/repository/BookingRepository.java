// BookingRepository.java
package com.aerolinea.repository;

import com.aerolinea.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> { }
