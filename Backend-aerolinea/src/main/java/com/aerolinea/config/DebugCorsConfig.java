package com.aerolinea.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Map;

@Configuration
public class DebugCorsConfig {

    @Bean
    public CommandLineRunner printCorsBeans(ApplicationContext ctx) {
        return args -> {
            Map<String, CorsConfigurationSource> beans = ctx.getBeansOfType(CorsConfigurationSource.class);
            System.out.println("CORS CONFIG SOURCES => " + beans.keySet());
            beans.forEach((name, bean) -> System.out.println("CORS BEAN => " + name + " :: " + bean.getClass()));
        };
    }
}
