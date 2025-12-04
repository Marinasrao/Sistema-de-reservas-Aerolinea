package com.aerolinea;

import com.aerolinea.entity.Recommendation;
import com.aerolinea.repository.RecommendationRepository;
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
    public CommandLineRunner initData(RecommendationRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                Recommendation rec = new Recommendation();
                rec.setTitle("Prueba");
                rec.setDescription("Vuelo de prueba");
                rec.setOrigin("Buenos Aires");
                rec.setDestination("Bariloche");
                rec.setDepartureDate("2025-12-01");
                rec.setReturnDate("2025-12-10");
                rec.setPrice(99999.99);
                rec.setImageUrl("bariloche.jpg");
                repo.save(rec);
                System.out.println("✅ Recomendación de prueba guardada.");
            }
        };
    }
}
