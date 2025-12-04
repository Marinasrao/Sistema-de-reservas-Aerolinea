package com.aerolinea.service;

import com.aerolinea.entity.Booking;
import com.aerolinea.entity.Passenger;
import com.aerolinea.repository.BookingRepository;
import com.aerolinea.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    public Booking saveBooking(Booking booking) {
        Passenger savedPassenger = passengerRepository.save(booking.getPassenger());
        booking.setPassenger(savedPassenger);

        return bookingRepository.save(booking);
    }
}

