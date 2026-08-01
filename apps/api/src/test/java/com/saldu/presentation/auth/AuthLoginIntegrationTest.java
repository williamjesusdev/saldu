package com.saldu.presentation.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.presentation.auth.dto.LoginRequest;

@AutoConfigureMockMvc
class AuthLoginIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        Subscription subscription = Subscription.createFree();
        subscription = subscriptionRepository.save(subscription);

        User testUser = User.create(
                subscription.getId(),
                "Integration User",
                "user@saldu.com",
                passwordEncoder.encode("ValidPass!123"),
                UserRole.USER);
        userRepository.save(testUser);
    }

    @AfterEach
    void cleanup() {
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should return 200 OK and token when login credentials are valid")
    void login_ValidCredentials_ReturnsOkAndToken() throws Exception {
        LoginRequest request = new LoginRequest("user@saldu.com", "ValidPass!123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when password is invalid")
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("user@saldu.com", "WrongPassword123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when email does not exist")
    void login_NonExistentEmail_ReturnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("nobody@saldu.com", "ValidPass!123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 204 No Content and clear authentication cookie upon logout")
    void logout_ValidRequest_ClearsCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(result -> {
                    String setCookieHeader = result.getResponse().getHeader("Set-Cookie");
                    assertThat(setCookieHeader).isNotNull().contains("saldu-token=;");
                });
    }
}
