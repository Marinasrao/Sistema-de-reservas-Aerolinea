package com.aerolinea.service;

import com.aerolinea.entity.Role;
import com.aerolinea.entity.User;
import com.aerolinea.repository.RoleRepository;
import com.aerolinea.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createAdmin(User data) {

        User user = userRepository.findByEmail(data.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow();

        if (!user.getRoles().contains(adminRole)) {
            user.getRoles().add(adminRole);
        }

        return userRepository.save(user);
    }

    public List<User> getAdmins() {
        return userRepository.findAllAdmins();
    }

    public User updateAdmin(Long id, User data) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setFirstName(data.getFirstName());
        user.setLastName(data.getLastName());
        user.setEmail(data.getEmail());

        if (data.getPassword() != null && !data.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(data.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteAdmin(Long id) {
        userRepository.deleteById(id);
    }
}
