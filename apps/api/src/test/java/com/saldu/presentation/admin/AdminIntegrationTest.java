package com.saldu.presentation.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.security.JwtService;
import com.saldu.presentation.admin.dto.CreateInviteRequest;
import com.saldu.presentation.admin.dto.RejectRequest;

@AutoConfigureMockMvc
class AdminIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private InviteTokenRepository inviteTokenRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String normalToken;

    @BeforeEach
    void setUp() {
        Subscription subscription = Subscription.createFree();
        subscription = subscriptionRepository.save(subscription);

        User adminUser =
                User.create(subscription.getId(), "Admin User", "admin@saldu.com", "Hash", UserRole.PLATFORM_ADMIN);
        adminUser = userRepository.save(adminUser);

        User normalUser = User.create(subscription.getId(), "Normal User", "normal@saldu.com", "Hash", UserRole.USER);
        normalUser = userRepository.save(normalUser);

        adminToken = jwtService.generateToken(
                adminUser.getId(), subscription.getId(), adminUser.getEmail(), adminUser.getRole());
        normalToken = jwtService.generateToken(
                normalUser.getId(), subscription.getId(), normalUser.getEmail(), normalUser.getRole());
    }

    @AfterEach
    void cleanup() {
        inviteTokenRepository.deleteAll();
        accessRequestRepository.deleteAll();
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should allow platform admin to list invites")
    void listInvites_AdminUser_ReturnsPagedInvites() throws Exception {
        mockMvc.perform(get("/api/v1/admin/invites").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Should return 403 Forbidden when normal user attempts to list invites")
    void listInvites_NormalUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/invites").header("Authorization", "Bearer " + normalToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when requesting invites with invalid token")
    void listInvites_InvalidToken_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/invites").header("Authorization", "Bearer " + "invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should allow platform admin to create an invite token")
    void createInvite_AdminUser_CreatesInviteToken() throws Exception {
        CreateInviteRequest request = new CreateInviteRequest("invited@saldu.com");

        mockMvc.perform(post("/api/v1/admin/invites")
                        .with(csrf().asHeader())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());

        assertThat(inviteTokenRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Should return 403 Forbidden when normal user attempts to create an invite")
    void createInvite_NormalUser_ReturnsForbidden() throws Exception {
        CreateInviteRequest request = new CreateInviteRequest("");

        mockMvc.perform(post("/api/v1/admin/invites")
                        .header("Authorization", "Bearer " + normalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow platform admin to approve a registration request")
    void approveRequest_AdminUser_ApprovesAccessRequest() throws Exception {
        AccessRequest request = AccessRequest.createPending("Pending User", "pending@saldu.com");
        request = accessRequestRepository.save(request);

        mockMvc.perform(post("/api/v1/admin/register/" + request.getId() + "/approval")
                        .with(csrf().asHeader())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("pending@saldu.com"));

        assertThat(userRepository.findByEmailAndDeletedAtIsNull("pending@saldu.com"))
                .isPresent();
    }

    @Test
    @DisplayName("Should allow platform admin to reject a registration request")
    void rejectRequest_AdminUser_RejectsAccessRequest() throws Exception {
        AccessRequest request = AccessRequest.createPending("Pending User", "reject@saldu.com");
        request = accessRequestRepository.save(request);

        RejectRequest rejectRequest = new RejectRequest("Not right now");

        mockMvc.perform(post("/api/v1/admin/register/" + request.getId() + "/rejection")
                        .with(csrf().asHeader())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        AccessRequest updatedRequest =
                accessRequestRepository.findById(request.getId()).orElseThrow();
        assertThat(updatedRequest.isRejected()).isTrue();
    }
}
