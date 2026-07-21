package com.aerolinea.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres.")
    @Column(nullable = false, length = 120)
    private String name;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Size(min = 8, max = 30, message = "El teléfono debe tener entre 8 y 30 caracteres.")
    @Column(nullable = false, length = 30)
    private String phone;

    @Email(message = "El correo electrónico no tiene un formato válido.")
    @Size(max = 150, message = "El correo electrónico no puede superar los 150 caracteres.")
    @Column(length = 150)
    private String email;

    @NotBlank(message = "La consulta es obligatoria.")
    @Size(
            min = 10,
            max = 1000,
            message = "La consulta debe tener entre 10 y 1000 caracteres."
    )
    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, length = 30)
    private String channel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }

        if (channel == null || channel.isBlank()) {
            channel = "WEB";
        }
    }
}