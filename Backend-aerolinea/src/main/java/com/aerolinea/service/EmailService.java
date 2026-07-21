package com.aerolinea.service;

import com.aerolinea.dto.OnlineReservationRequest;
import com.aerolinea.entity.Passenger;

import java.util.List;

public interface EmailService {
    void sendEmail(String to, String subject, String text);

    void sendActivationEmail(String to, String activationLink);

    void sendReservationConfirmationEmail(
            String to,
            OnlineReservationRequest request,
            List<Passenger> savedPassengers
    );
}