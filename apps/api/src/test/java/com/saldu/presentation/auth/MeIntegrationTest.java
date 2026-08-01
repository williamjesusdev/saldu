package com.saldu.presentation.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import com.saldu.infrastructure.security.JwtService;
import com.saldu.presentation.auth.dto.ChangePasswordRequest;

@AutoConfigureMockMvc
class MeIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String token;

    @BeforeEach
    void setUp() {
        Subscription subscription = Subscription.createFree();
        subscription = subscriptionRepository.save(subscription);

        testUser = User.create(
                subscription.getId(),
                "Test User",
                "user@saldu.com",
                passwordEncoder.encode("CurrentPassword123!"),
                UserRole.USER);
        testUser = userRepository.save(testUser);

        token = jwtService.generateToken(
                testUser.getId(), subscription.getId(), testUser.getEmail(), testUser.getRole());
    }

    @AfterEach
    void cleanup() {
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should return user profile when request is authenticated")
    void getProfile_Authenticated_ReturnsUserProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@saldu.com"))
                .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when request is unauthenticated")
    void getProfile_Unauthenticated_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should change user password successfully when current password matches")
    void changePassword_ValidCurrentPassword_UpdatesPassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("CurrentPassword123!", "NewStrongPassword123!");

        mockMvc.perform(post("/api/v1/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NewStrongPassword123!", updatedUser.getPasswordHash()))
                .isTrue();
    }

    @Test
    @DisplayName("Should record user consent successfully")
    void giveConsent_Authenticated_RecordsConsent() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/consent").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getConsentGivenAt()).isNotNull();
    }

    @Test
    @DisplayName("Should soft delete user account successfully")
    void deleteAccount_Authenticated_SoftDeletesAccount() throws Exception {
        mockMvc.perform(delete("/api/v1/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getDeletedAt()).isNotNull();
    }
}
