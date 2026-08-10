package com.fitforge.subscriptions.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RevenueCatSignatureFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (!"/webhooks/revenuecat".equals(request.getRequestURI()) || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String signature = extractSignature(request);
        String secret = System.getenv("REVENUECAT_WEBHOOK_SECRET");
        if (secret == null || secret.isBlank() || signature == null || signature.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String payload = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            String expected = hmacSha256(secret, payload);
            if (expected.equals(signature)) {
                filterChain.doFilter(request, response);
            } else {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid webhook signature");
            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unable to verify webhook signature");
        }
    }

    private String extractSignature(HttpServletRequest request) {
        String sig = request.getHeader("X-RevenueCat-Signature");
        if (sig != null && sig.startsWith("sha256=")) {
            return sig.substring(7);
        }
        return sig;
    }

    private String hmacSha256(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(raw.length * 2);
        for (byte b : raw) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
