package com.fitforge.subscriptions.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, RevenueCatSignatureFilter revenueCatSignatureFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/entitlements/**").hasAuthority("SCOPE_service")
                        .requestMatchers(HttpMethod.POST, "/webhooks/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(serviceTokenFilter(), BasicAuthenticationFilter.class)
                .addFilterBefore(revenueCatSignatureFilter, BasicAuthenticationFilter.class)
                .httpBasic(basic -> { });
        return http.build();
    }

    @Bean
    public OncePerRequestFilter serviceTokenFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                String token = request.getHeader("X-Service-Token");
                String expected = System.getenv("SERVICE_TOKEN");
                if (expected != null && !expected.isBlank() && expected.equals(token)) {
                    filterChain.doFilter(request, response);
                } else {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid service token");
                }
            }
        };
    }
}
