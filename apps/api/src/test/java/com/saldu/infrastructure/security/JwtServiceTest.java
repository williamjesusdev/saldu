package com.saldu.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.saldu.domain.user.model.UserRole;
import com.saldu.infrastructure.config.SalduProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

    private static final long ONE_HOUR = 3600000L;

    private final UUID userId = UUID.randomUUID();
    private final UUID subscriptionId = UUID.randomUUID();
    private final String email = "test@saldu.com";
    private final UserRole role = UserRole.USER;

    private JwtService jwtService;
    private SalduProperties properties;

    @BeforeEach
    void setUp() {
        properties = new SalduProperties();
        SalduProperties.Jwt jwt = new SalduProperties.Jwt();
        jwt.setSecret("this-is-a-very-long-secret-key-for-testing-purposes");
        jwt.setExpirationMs(ONE_HOUR);
        jwt.setCookieName("saldu_token");
        properties.setJwt(jwt);

        jwtService = new JwtService(properties);
    }

    @Test
    @DisplayName("Should generate and parse valid token")
    void shouldGenerateAndParseToken() {
        String token = jwtService.generateToken(userId, subscriptionId, email, role);

        assertThat(token).isNotBlank();

        Claims claims = jwtService.parseToken(token);
        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("subscription_id")).isEqualTo(subscriptionId.toString());
        assertThat(claims.get("email")).isEqualTo(email);
        assertThat(claims.get("role")).isEqualTo(role.name());
    }

    @Test
    @DisplayName("Should return true for valid token")
    void shouldValidateToken() {
        String token = jwtService.generateToken(userId, subscriptionId, email, role);
        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("Should return false for invalid token")
    void shouldInvalidateToken() {
        assertThat(jwtService.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    @DisplayName("Should extract correct properties")
    void shouldExtractProperties() {
        String token = jwtService.generateToken(userId, subscriptionId, email, role);

        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractSubscriptionId(token)).isEqualTo(subscriptionId);
        assertThat(jwtService.extractEmail(token)).isEqualTo(email);
        assertThat(jwtService.extractRole(token)).isEqualTo(role);
        assertThat(jwtService.getCookieName()).isEqualTo("saldu_token");
    }

    @Test
    @DisplayName("Should return null subscription id if not present")
    void shouldReturnNullSubscriptionIfAbsent() {
        String secret = properties.getJwt().getSecret();
        String token = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role.name())
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThat(jwtService.extractSubscriptionId(token)).isNull();
    }

    @Test
    @DisplayName("Should default role to USER if missing")
    void shouldDefaultRoleToUserIfMissing() {
        String secret = properties.getJwt().getSecret();
        String token = Jwts.builder()
                .subject(userId.toString())
                .claim("subscription_id", subscriptionId.toString())
                .claim("email", email)
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThat(jwtService.extractRole(token)).isEqualTo(UserRole.USER);
    }

    @Test
    @DisplayName("Should extract token from cookie")
    void shouldExtractTokenFromCookie() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(new Cookie[] {
            new Cookie("other_cookie", "ignore"), new Cookie("saldu_token", "my-valid-token")
        });

        String extracted = jwtService.extractTokenFromRequest(request);
        assertThat(extracted).isEqualTo("my-valid-token");
    }

    @Test
    @DisplayName("Should extract token from Authorization header if cookie missing")
    void shouldExtractTokenFromHeader() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer my-header-token");

        String extracted = jwtService.extractTokenFromRequest(request);
        assertThat(extracted).isEqualTo("my-header-token");
    }

    @Test
    @DisplayName("Should return null if neither cookie nor valid header exists")
    void shouldReturnNullIfNoTokenPresent() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(new Cookie[0]);
        when(request.getHeader("Authorization")).thenReturn("Basic invalid-token");

        String extracted = jwtService.extractTokenFromRequest(request);
        assertThat(extracted).isNull();

        when(request.getHeader("Authorization")).thenReturn(null);
        extracted = jwtService.extractTokenFromRequest(request);
        assertThat(extracted).isNull();
    }
}
