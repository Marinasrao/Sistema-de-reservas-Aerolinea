package com.aerolinea;

import com.aerolinea.entity.Recommendation;
import com.aerolinea.entity.Role;
import com.aerolinea.repository.RecommendationRepository;
import com.aerolinea.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AerolineaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AerolineaApplication.class, args);
    }


    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (!roleRepository.existsByName("ROLE_USER")) {
                Role user = new Role();
                user.setName("ROLE_USER");
                roleRepository.save(user);
            }

            if (!roleRepository.existsByName("ROLE_ADMIN")) {
                Role admin = new Role();
                admin.setName("ROLE_ADMIN");
                roleRepository.save(admin);
            }
        };
    }



}
