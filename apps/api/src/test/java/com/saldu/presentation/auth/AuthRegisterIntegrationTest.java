package com.saldu.presentation.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.AccessRequestStatus;
import com.saldu.domain.user.model.InviteToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.presentation.auth.dto.AcceptInviteRequest;
import com.saldu.presentation.auth.dto.RegisterRequest;

@AutoConfigureMockMvc
class AuthRegisterIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @AfterEach
    void cleanup() {
        inviteTokenRepository.deleteAll();
        accessRequestRepository.deleteAll();
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should register an access request successfully when data is valid")
    void registerAccessRequest_ValidData_CreatesPendingRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "register@saldu.com", "StrongPassword123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("register@saldu.com"))
                .andExpect(jsonPath("$.status").value("pending"));

        boolean exists =
                accessRequestRepository.existsByEmailAndStatus("register@saldu.com", AccessRequestStatus.PENDING);
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should accept an invite successfully when token is valid")
    void acceptInvite_ValidToken_CreatesUserAccount() throws Exception {
        Subscription sub = Subscription.createFree();
        subscriptionRepository.save(sub);
        User adminUser = User.create(sub.getId(), "Admin", "admin@saldu.com", "hash", UserRole.PLATFORM_ADMIN);
        userRepository.save(adminUser);

        InviteToken token = InviteToken.create(adminUser.getId(), "invited@saldu.com", 7);
        inviteTokenRepository.save(token);

        AcceptInviteRequest request =
                new AcceptInviteRequest("Invited User", "invited@saldu.com", "StrongPassword123!", token.getToken());

        mockMvc.perform(post("/api/v1/auth/invite/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("invited@saldu.com"));

        assertThat(userRepository.findByEmailAndDeletedAtIsNull("invited@saldu.com"))
                .isPresent();

        InviteToken usedToken = inviteTokenRepository.findById(token.getId()).orElseThrow();
        assertThat(usedToken.isUsed()).isTrue();
    }
}
