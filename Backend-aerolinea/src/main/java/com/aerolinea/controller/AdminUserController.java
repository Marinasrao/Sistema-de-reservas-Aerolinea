package com.aerolinea.controller;

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
    public User createAdmin(@RequestBody User user) {
        return adminUserService.createAdmin(user);
    }

    @GetMapping
    public List<User> getAdmins() {
        return adminUserService.getAdmins();
    }


    @PutMapping("/{id}")
    public User updateAdmin(@PathVariable Long id, @RequestBody User data) {
        return adminUserService.updateAdmin(id, data);
    }


    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable Long id) {
        adminUserService.deleteAdmin(id);
    }
}
