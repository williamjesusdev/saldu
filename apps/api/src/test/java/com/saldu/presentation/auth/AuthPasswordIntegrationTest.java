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
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.PasswordResetToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.PasswordResetTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.presentation.auth.dto.PasswordResetRequest;
import com.saldu.presentation.auth.dto.PasswordResetVerifyRequest;

@AutoConfigureMockMvc
class AuthPasswordIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        Subscription subscription = Subscription.createFree();
        subscription = subscriptionRepository.save(subscription);

        testUser = User.create(subscription.getId(), "Test User", "user@saldu.com", "Hash", UserRole.USER);
        testUser = userRepository.save(testUser);
    }

    @AfterEach
    void cleanup() {
        resetTokenRepository.deleteAll();
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should request password reset successfully when email exists")
    void requestPasswordReset_ValidEmail_CreatesResetToken() throws Exception {
        PasswordResetRequest request = new PasswordResetRequest("user@saldu.com");

        mockMvc.perform(post("/api/v1/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        assertThat(resetTokenRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Should verify password reset token and update password successfully")
    void verifyPasswordReset_ValidToken_ResetsPassword() throws Exception {
        PasswordResetToken token = PasswordResetToken.create(testUser.getId(), 2);
        resetTokenRepository.save(token);

        PasswordResetVerifyRequest request =
                new PasswordResetVerifyRequest("user@saldu.com", token.getToken(), "NewStrongPassword123!");

        mockMvc.perform(post("/api/v1/auth/password/reset/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        PasswordResetToken usedToken =
                resetTokenRepository.findById(token.getId()).orElseThrow();
        assertThat(usedToken.isUsed()).isTrue();
    }
}
