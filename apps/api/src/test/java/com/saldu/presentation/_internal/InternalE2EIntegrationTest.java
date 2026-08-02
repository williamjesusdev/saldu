package com.saldu.presentation._internal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.PasswordResetToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.PasswordResetTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;

@AutoConfigureMockMvc
class InternalE2EIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @BeforeEach
    void setUp() {
        resetTokenRepository.deleteAll();
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should return latest password reset token for E2E user")
    void getLatestResetToken_TokenExists_ReturnsResetToken() throws Exception {
        Subscription sub = subscriptionRepository.save(Subscription.createFree());
        User user = User.create(sub.getId(), "Test User", "test@saldu.com", "hash", UserRole.USER);
        userRepository.saveAndFlush(user);

        PasswordResetToken token = PasswordResetToken.create(user.getId(), 24);
        resetTokenRepository.saveAndFlush(token);

        mockMvc.perform(get("/api/v1/_internal/e2e/password/reset/token").param("email", "test@saldu.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(token.getToken()));
    }

    @Test
    @DisplayName("Should return 404 Not Found when user does not exist")
    void getLatestResetToken_UserNotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/_internal/e2e/password/reset/token").param("email", "notfound@saldu.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return 404 Not Found when user has no password reset tokens")
    void getLatestResetToken_NoTokens_Returns404() throws Exception {
        Subscription sub = subscriptionRepository.save(Subscription.createFree());

        User user = User.create(sub.getId(), "No Token User", "notoken@saldu.com", "hash", UserRole.USER);
        userRepository.saveAndFlush(user);

        mockMvc.perform(get("/api/v1/_internal/e2e/password/reset/token").param("email", "notoken@saldu.com"))
                .andExpect(status().isNotFound());
    }
}
