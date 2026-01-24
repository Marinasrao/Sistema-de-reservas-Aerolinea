package com.aerolinea.controller;

import com.aerolinea.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestEmailController {

    private final EmailService emailService;

    @GetMapping("/test-email")
    public String testEmail() {
        emailService.sendEmail(
                "test@example.com",
                "Prueba Mailtrap",
                "Hola Marinaaa ✈️ Esto es una prueba!"
        );
        return "Email enviado";
    }
}
