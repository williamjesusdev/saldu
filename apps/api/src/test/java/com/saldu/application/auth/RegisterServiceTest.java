package com.saldu.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.saldu.application.auth.dto.AccessRequestResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.AccessRequestStatus;
import com.saldu.domain.user.model.InviteToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class RegisterServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private AccessRequestRepository accessRequestRepository;

    @Mock
    private InviteTokenRepository inviteTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegisterService registerService;

    @Test
    @DisplayName("Should register access request successfully when email is available")
    void registerAccessRequest_ValidData_ReturnsAccessRequestResponse() {
        when(userRepository.existsByEmailAndDeletedAtIsNull("test-new@saldu.com"))
                .thenReturn(false);
        when(accessRequestRepository.existsByEmailAndStatus("test-new@saldu.com", AccessRequestStatus.PENDING))
                .thenReturn(false);

        AccessRequest mockRequest = AccessRequest.createPending("New User", "test-new@saldu.com");
        when(accessRequestRepository.save(any(AccessRequest.class))).thenReturn(mockRequest);

        AccessRequestResponse response =
                registerService.registerAccessRequest("New User", "test-new@saldu.com", "pass");

        assertThat(response.email()).isEqualTo("test-new@saldu.com");
        assertThat(response.status()).isEqualTo(AccessRequestStatus.PENDING);
        verify(accessRequestRepository).save(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when registering access request with existing user email")
    void registerAccessRequest_EmailExists_ThrowsException() {
        when(userRepository.existsByEmailAndDeletedAtIsNull("test-new@saldu.com"))
                .thenReturn(true);

        Throwable thrown =
                catchThrowable(() -> registerService.registerAccessRequest("User", "test-new@saldu.com", "pass"));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        assertThat(((BusinessException) thrown).getStatus()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should accept invite successfully when token is valid")
    void acceptInvite_ValidToken_CreatesUserAndReturnsResponse() {
        InviteToken mockToken = InviteToken.create(UUID.randomUUID(), "test-invited@saldu.com", 7);
        when(inviteTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));
        when(userRepository.existsByEmailAndDeletedAtIsNull("test-invited@saldu.com"))
                .thenReturn(false);

        Subscription sub = Subscription.createFree();
        when(subscriptionRepository.save(any())).thenReturn(sub);

        when(passwordEncoder.encode("pass")).thenReturn("hash");

        User savedUser = User.create(sub.getId(), "Name", "test-invited@saldu.com", "hash", UserRole.USER);
        when(userRepository.save(any())).thenReturn(savedUser);

        UserResponse response =
                registerService.acceptInvite("Name", "test-invited@saldu.com", "pass", mockToken.getToken());

        assertThat(response.email()).isEqualTo("test-invited@saldu.com");
        assertThat(mockToken.isUsed()).isTrue();
        verify(inviteTokenRepository).save(mockToken);
    }

    @Test
    @DisplayName("Should throw BusinessException when accepting invite with invalid or expired token")
    void acceptInvite_InvalidToken_ThrowsException() {
        InviteToken mockToken = InviteToken.create(UUID.randomUUID(), "test-invited@saldu.com", 7);
        mockToken.markAsUsed(UUID.randomUUID());

        when(inviteTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));

        Throwable thrown = catchThrowable(
                () -> registerService.acceptInvite("N", "test-invited@saldu.com", "p", mockToken.getToken()));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        assertThat(((BusinessException) thrown).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when access request for email is already pending")
    void registerAccessRequest_AccessRequestPending_ThrowsException() {
        when(userRepository.existsByEmailAndDeletedAtIsNull("test-new@saldu.com"))
                .thenReturn(false);
        when(accessRequestRepository.existsByEmailAndStatus("test-new@saldu.com", AccessRequestStatus.PENDING))
                .thenReturn(true);

        Throwable thrown =
                catchThrowable(() -> registerService.registerAccessRequest("User", "test-new@saldu.com", "pass"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.email_already_exists")
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should throw BusinessException when invite token is not found")
    void acceptInvite_TokenNotFound_ThrowsException() {
        when(inviteTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        Throwable thrown =
                catchThrowable(() -> registerService.acceptInvite("Name", "test@saldu.com", "pass", "invalid-token"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when invite token email does not match provided email")
    void acceptInvite_EmailMismatch_ThrowsException() {
        InviteToken mockToken = InviteToken.create(UUID.randomUUID(), "specific@saldu.com", 7);
        when(inviteTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));

        Throwable thrown = catchThrowable(
                () -> registerService.acceptInvite("Name", "wrong@saldu.com", "pass", mockToken.getToken()));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when user already exists for invited email")
    void acceptInvite_UserAlreadyExists_ThrowsException() {
        InviteToken mockToken = InviteToken.create(UUID.randomUUID(), "test-invited@saldu.com", 7);
        when(inviteTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));
        when(userRepository.existsByEmailAndDeletedAtIsNull("test-invited@saldu.com"))
                .thenReturn(true);

        Throwable thrown = catchThrowable(
                () -> registerService.acceptInvite("Name", "test-invited@saldu.com", "pass", mockToken.getToken()));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.email_already_exists")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should accept invite successfully when token has no specific target email")
    void acceptInvite_NullTokenEmail_CreatesUserAndReturnsResponse() {
        InviteToken mockToken = InviteToken.create(UUID.randomUUID(), null, 7);
        when(inviteTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));
        when(userRepository.existsByEmailAndDeletedAtIsNull("any-email@saldu.com"))
                .thenReturn(false);

        Subscription sub = Subscription.createFree();
        when(subscriptionRepository.save(any())).thenReturn(sub);

        when(passwordEncoder.encode("pass")).thenReturn("hash");

        User savedUser = User.create(sub.getId(), "Name", "any-email@saldu.com", "hash", UserRole.USER);
        when(userRepository.save(any())).thenReturn(savedUser);

        UserResponse response =
                registerService.acceptInvite("Name", "any-email@saldu.com", "pass", mockToken.getToken());

        assertThat(response.email()).isEqualTo("any-email@saldu.com");
        assertThat(mockToken.isUsed()).isTrue();
        verify(inviteTokenRepository).save(mockToken);
    }
}
