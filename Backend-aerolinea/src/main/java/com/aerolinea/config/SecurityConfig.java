package com.aerolinea.config;

import com.aerolinea.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/api/categories/admin/**")
                        .hasAuthority("ROLE_ADMIN")

                        /*
                         * Rutas públicas.
                         */
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/recommendations/**",
                                "/api/hero/**",
                                "/api/categories/**",
                                "/api/availability/**",
                                "/api/flights/**",
                                "/api/contact-messages/**",
                                "/uploads/**",
                                "/images/**",
                                "/api/public/**",
                                "/test-email",
                                "/api/policies/**",
                                "/api/cities/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/passengers/available-seats"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reviews/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/reviews/**"
                        )
                        .authenticated()

                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}