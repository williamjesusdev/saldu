package com.saldu.infrastructure.security;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.UserRole;

@AutoConfigureMockMvc
class CsrfIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Should return 403 Forbidden when protected POST request lacks CSRF token")
    void post_MissingCsrfToken_ReturnsForbidden() throws Exception {
        String token = jwtService.generateToken(UUID.randomUUID(), UUID.randomUUID(), "test@saldu.com", UserRole.USER);
        mockMvc.perform(post("/api/v1/accounts")
                        .cookie(new Cookie("saldu-token", token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow protected POST request when valid CSRF token header is provided")
    void post_ValidCsrfToken_AllowsRequest() throws Exception {
        String token = jwtService.generateToken(UUID.randomUUID(), UUID.randomUUID(), "test@saldu.com", UserRole.USER);
        mockMvc.perform(post("/api/v1/accounts")
                        .cookie(new Cookie("saldu-token", token), new Cookie("XSRF-TOKEN", "test-csrf-token"))
                        .header("X-XSRF-TOKEN", "test-csrf-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }
}
