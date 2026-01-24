package com.aerolinea.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    @Override
    public void sendActivationEmail(String to, String activationLink) {
        String subject = "¡Bienvenida/o a FlightBooking! Activá tu cuenta ✈️";

        String text = String.format(
                "Hola!\n\n" +
                        "¡Gracias por registrarte en FlightBooking! ✈️\n\n" +
                        "Tu cuenta fue creada correctamente con el siguiente correo:\n" +
                        "- Email: %s\n\n" +
                        "Para activar tu cuenta y comenzar a usarla, hacé clic en el siguiente enlace:\n" +
                        "%s\n\n" +
                        "Si no realizaste este registro, podés ignorar este mensaje.\n\n" +
                        "¿No recibiste el correo de activación?\n" +
                        "Desde la aplicación podrás solicitar que se reenvíe.\n\n" +
                        "¡Buen viaje!\n" +
                        "Equipo FlightBooking ✈️",
                to,
                activationLink
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

}


