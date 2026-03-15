package com.aerolinea.service;

import com.aerolinea.dto.AuthResponse;
import com.aerolinea.dto.LoginRequest;
import com.aerolinea.dto.RegisterRequest;

import java.util.Map;

public interface AuthService {

    void register(RegisterRequest request);

    void activateAccount(String token);

    AuthResponse login(LoginRequest request);

    Map<String, Object> getCurrentUser(String email);
}
