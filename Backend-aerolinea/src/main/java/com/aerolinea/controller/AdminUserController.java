package com.aerolinea.controller;

import com.aerolinea.dto.UserResponseDTO;
import com.aerolinea.entity.User;
import com.aerolinea.service.AdminUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PostMapping
    public UserResponseDTO createAdmin(@RequestBody User user) {
        User created = adminUserService.createAdmin(user);
        return mapToDTO(created);
    }

    @GetMapping
    public List<UserResponseDTO> getAdmins() {
        return adminUserService.getAdmins()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @PutMapping("/{id}")
    public UserResponseDTO updateAdmin(@PathVariable Long id, @RequestBody User data) {
        User updated = adminUserService.updateAdmin(id, data);
        return mapToDTO(updated);
    }

    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable Long id) {
        adminUserService.deleteAdmin(id);
    }

    private UserResponseDTO mapToDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled()
        );
    }
}

