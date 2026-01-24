package com.aerolinea.controller;

import com.aerolinea.dto.AuthResponse;
import com.aerolinea.dto.RegisterRequest;
import com.aerolinea.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.aerolinea.dto.LoginRequest;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new AuthResponse("Usuario registrado. Revise su email para activarlo."));
    }

    @GetMapping("/activate")
    public ResponseEntity<AuthResponse> activate(@RequestParam String token) {
        authService.activateAccount(token);
        return ResponseEntity.ok(new AuthResponse("Cuenta activada correctamente."));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
