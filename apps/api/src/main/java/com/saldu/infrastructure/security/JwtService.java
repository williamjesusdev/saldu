package com.saldu.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;
import javax.crypto.SecretKey;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;

import com.saldu.domain.user.model.UserRole;
import com.saldu.infrastructure.config.SalduProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final String cookieName;

    public JwtService(SalduProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = properties.getJwt().getExpirationMs();
        this.cookieName = properties.getJwt().getCookieName();
    }

    public String getCookieName() {
        return cookieName;
    }

    public String generateToken(UUID userId, UUID subscriptionId, String email, UserRole role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("subscription_id", subscriptionId.toString())
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public UUID extractSubscriptionId(String token) {
        Claims claims = parseToken(token);
        String subId = claims.get("subscription_id", String.class);
        return subId != null ? UUID.fromString(subId) : null;
    }

    public UUID extractUserId(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractEmail(String token) {
        Claims claims = parseToken(token);
        return claims.get("email", String.class);
    }

    public UserRole extractRole(String token) {
        Claims claims = parseToken(token);
        String roleStr = claims.get("role", String.class);
        return UserRole.valueOf(Objects.requireNonNullElse(roleStr, "USER"));
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception _) {
            return false;
        }
    }

    public String extractTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (Objects.requireNonNullElse(authHeader, "").startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
