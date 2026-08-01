package com.saldu.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.saldu.application.admin.dto.InviteResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.InviteToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.presentation.admin.dto.InviteStatusFilter;

@ExtendWith(MockitoExtension.class)
class AdminInviteServiceTest {

    @Mock
    private InviteTokenRepository inviteTokenRepository;

    @Mock
    private AccessRequestRepository accessRequestRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminInviteService adminInviteService;

    private UUID adminUserId;

    @BeforeEach
    void setUp() {
        adminUserId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should create invite successfully when data is valid")
    void createInvite_ValidData_ReturnsInviteResponse() {
        InviteToken mockToken = InviteToken.create(adminUserId, "test@saldu.com", 7);
        when(inviteTokenRepository.save(any(InviteToken.class))).thenReturn(mockToken);

        InviteResponse response = adminInviteService.createInvite(adminUserId, "test@saldu.com");

        assertThat(response.email()).isEqualTo("test@saldu.com");
        verify(inviteTokenRepository).save(any());
    }

    @Test
    @DisplayName("Should return empty page when no tokens exist")
    void listInvites_NoTokens_ReturnsEmptyPage() {
        when(inviteTokenRepository.findAllByUsedStatus(any(), any(PageRequest.class)))
                .thenReturn(Page.empty());

        Page<InviteResponse> response = adminInviteService.listInvites(0, 10, null);

        assertThat(response.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should return paged invites when tokens exist without filter")
    void listInvites_WithTokens_ReturnsPagedInvites() {
        InviteToken mockToken = InviteToken.create(adminUserId, "test@saldu.com", 7);
        Page<InviteToken> mockPage = new PageImpl<>(List.of(mockToken));
        when(inviteTokenRepository.findAllByUsedStatus(any(), any(PageRequest.class)))
                .thenReturn(mockPage);

        Page<InviteResponse> response = adminInviteService.listInvites(0, 10, null);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).email()).isEqualTo("test@saldu.com");
    }

    @Test
    @DisplayName("Should filter invites by pending status")
    void listInvites_PendingFilter_ReturnsPendingInvites() {
        InviteToken mockToken1 = InviteToken.create(adminUserId, "test1@saldu.com", 7);
        InviteToken mockToken2 = InviteToken.create(adminUserId, "test2@saldu.com", 7);
        mockToken2.markAsUsed(UUID.randomUUID());

        Page<InviteToken> mockPage = new PageImpl<>(List.of(mockToken1));
        when(inviteTokenRepository.findAllByUsedStatus(eq(false), any(PageRequest.class)))
                .thenReturn(mockPage);

        Page<InviteResponse> response = adminInviteService.listInvites(0, 10, InviteStatusFilter.PENDING);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).email()).isEqualTo("test1@saldu.com");
    }

    @Test
    @DisplayName("Should approve access request successfully")
    void approveAccessRequest_ValidRequest_ApprovesAndCreatesUser() {
        AccessRequest mockRequest = AccessRequest.createPending("Pending", "test-pending@saldu.com");
        when(accessRequestRepository.findById(mockRequest.getId())).thenReturn(Optional.of(mockRequest));

        Subscription sub = Subscription.createFree();
        when(subscriptionRepository.save(any())).thenReturn(sub);

        when(passwordEncoder.encode(any())).thenReturn("hashed");

        User mockUser = User.create(sub.getId(), "Pending", "test-pending@saldu.com", "hashed", UserRole.USER);
        when(userRepository.save(any())).thenReturn(mockUser);

        UserResponse response = adminInviteService.approveAccessRequest(adminUserId, mockRequest.getId());

        assertThat(response.email()).isEqualTo("test-pending@saldu.com");
        assertThat(mockRequest.isApproved()).isTrue();
        verify(accessRequestRepository).save(mockRequest);
    }

    @Test
    @DisplayName("Should reject access request successfully")
    void rejectAccessRequest_ValidRequest_RejectsAccessRequest() {
        AccessRequest mockRequest = AccessRequest.createPending("Pending", "test-pending@saldu.com");
        when(accessRequestRepository.findById(mockRequest.getId())).thenReturn(Optional.of(mockRequest));

        adminInviteService.rejectAccessRequest(adminUserId, mockRequest.getId(), "Reason");

        assertThat(mockRequest.isRejected()).isTrue();
        verify(accessRequestRepository).save(mockRequest);
    }

    @Test
    @DisplayName("Should throw BusinessException when invite already exists for email")
    void createInvite_EmailAlreadyInvited_ThrowsException() {
        when(inviteTokenRepository.existsByEmailAndUsedAtIsNullAndExpiresAtAfter(eq("test@saldu.com"), any()))
                .thenReturn(true);

        Throwable thrown = catchThrowable(() -> adminInviteService.createInvite(adminUserId, "test@saldu.com"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invite_already_exists")
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should throw BusinessException when user already exists")
    void createInvite_UserAlreadyExists_ThrowsException() {
        when(inviteTokenRepository.existsByEmailAndUsedAtIsNullAndExpiresAtAfter(eq("test@saldu.com"), any()))
                .thenReturn(false);
        when(userRepository.existsByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(true);

        Throwable thrown = catchThrowable(() -> adminInviteService.createInvite(adminUserId, "test@saldu.com"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.user_already_exists")
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should create invite with null email")
    void createInvite_NullEmail_ReturnsInviteResponse() {
        InviteToken mockToken = InviteToken.create(adminUserId, null, 7);
        when(inviteTokenRepository.save(any(InviteToken.class))).thenReturn(mockToken);

        InviteResponse response = adminInviteService.createInvite(adminUserId, null);

        assertThat(response.email()).isNull();
        verify(inviteTokenRepository).save(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when access request is not found upon approval")
    void approveAccessRequest_NotFound_ThrowsException() {
        UUID requestId = UUID.randomUUID();
        when(accessRequestRepository.findById(requestId)).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(() -> adminInviteService.approveAccessRequest(adminUserId, requestId));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when access request is not found upon rejection")
    void rejectAccessRequest_NotFound_ThrowsException() {
        UUID requestId = UUID.randomUUID();
        when(accessRequestRepository.findById(requestId)).thenReturn(Optional.empty());

        Throwable thrown =
                catchThrowable(() -> adminInviteService.rejectAccessRequest(adminUserId, requestId, "Reason"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should filter invites by used status")
    void listInvites_UsedFilter_ReturnsUsedInvites() {
        when(inviteTokenRepository.findAllByUsedStatus(eq(true), any(PageRequest.class)))
                .thenReturn(Page.empty());

        adminInviteService.listInvites(0, 10, InviteStatusFilter.USED);

        verify(inviteTokenRepository).findAllByUsedStatus(eq(true), any(PageRequest.class));
    }
}
