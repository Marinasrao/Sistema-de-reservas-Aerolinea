package com.aerolinea.controller;

import com.aerolinea.entity.ContactMessage;
import com.aerolinea.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact-messages")
@CrossOrigin(origins = "http://localhost:5173")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(
            ContactMessageService contactMessageService
    ) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createContactMessage(
            @Valid @RequestBody ContactMessage contactMessage
    ) {
        ContactMessage savedMessage =
                contactMessageService.createContactMessage(contactMessage);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", true);
        response.put(
                "message",
                "¡Tu mensaje fue recibido con éxito! En instantes nos estaremos comunicando con vos."
        );
        response.put("contactMessageId", savedMessage.getId());
        response.put("status", savedMessage.getStatus());
        response.put("channel", savedMessage.getChannel());
        response.put("createdAt", savedMessage.getCreatedAt());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}