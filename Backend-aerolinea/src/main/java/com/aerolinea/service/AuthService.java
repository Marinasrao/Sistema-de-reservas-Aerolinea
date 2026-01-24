package com.aerolinea.service;

import com.aerolinea.dto.LoginRequest;
import com.aerolinea.dto.RegisterRequest;
import com.aerolinea.entity.User;

public interface AuthService {

    void register(RegisterRequest request);

    void activateAccount(String token);

    User login(LoginRequest request);
}
