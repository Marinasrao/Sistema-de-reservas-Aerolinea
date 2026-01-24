package com.aerolinea.service;

import com.aerolinea.dto.RegisterRequest;
import com.aerolinea.entity.Role;
import com.aerolinea.entity.User;
import com.aerolinea.repository.RoleRepository;
import com.aerolinea.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.aerolinea.dto.LoginRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;



import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public void register(RegisterRequest request) {

        // 1. Validar si el email ya existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // 2. Buscar el rol por defecto
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("No existe el rol USER"));

        // 3. Crear usuario
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Collections.singleton(userRole));
        user.setEnabled(false);

        // 4. Generar token
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiration(LocalDateTime.now().plusHours(24));

        // 5. Guardar usuario
        userRepository.save(user);

        // 6. Enviar email de activación
        String activationLink = "http://localhost:8080/api/auth/activate?token=" + token;
        emailService.sendActivationEmail(user.getEmail(), activationLink);
    }

    @Override
    public void activateAccount(String token) {

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (user.getTokenExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token ha expirado.");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setTokenExpiration(null);

        userRepository.save(user);
    }

    @Override
    public User login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSessionSecurityContextRepository repo =
                new HttpSessionSecurityContextRepository();
        repo.saveContext(
                SecurityContextHolder.getContext(),
                ((org.springframework.web.context.request.ServletRequestAttributes)
                        org.springframework.web.context.request.RequestContextHolder
                                .currentRequestAttributes())
                        .getRequest(),
                null
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Cuenta no activada. Revisá tu email.");
        }

        return user;
    }


}

