package com.fitforge.subscriptions.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Entitlements are consumed service-to-service by the FastAPI backend.
                        .requestMatchers(HttpMethod.GET, "/entitlements/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/webhooks/**").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(basic -> { });
        return http.build();
    }
}