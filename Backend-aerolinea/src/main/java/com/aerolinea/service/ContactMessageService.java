package com.aerolinea.service;

import com.aerolinea.entity.ContactMessage;
import com.aerolinea.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository
    ) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessage createContactMessage(
            ContactMessage contactMessage
    ) {
        contactMessage.setId(null);
        contactMessage.setStatus("PENDING");
        contactMessage.setChannel("WEB");
        contactMessage.setCreatedAt(null);

        if (contactMessage.getEmail() != null
                && contactMessage.getEmail().isBlank()) {
            contactMessage.setEmail(null);
        }

        return contactMessageRepository.save(contactMessage);
    }
}