package com.aerolinea.service;

public interface EmailService {
    void sendEmail(String to, String subject, String text);
    void sendActivationEmail(String to, String activationLink);
}
