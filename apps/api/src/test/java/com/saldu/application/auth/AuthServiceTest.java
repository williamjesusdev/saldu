package com.saldu.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.saldu.application.audit.AuditService;
import com.saldu.application.auth.dto.LoginResponse;
import com.saldu.domain.user.model.AccessRequestStatus;
import com.saldu.domain.user.model.RevokedToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.RevokedTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.config.SalduProperties;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.infrastructure.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccessRequestRepository accessRequestRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RevokedTokenRepository revokedTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditService auditService;

    @Mock
    private SalduProperties salduProperties;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Subscription subscription;

    @BeforeEach
    void setUp() {
        subscription = Subscription.createFree();
        ReflectionTestUtils.setField(subscription, "id", UUID.randomUUID());
        testUser = User.create(subscription.getId(), "Test User", "test@saldu.com", "hashedPassword", UserRole.USER);
        ReflectionTestUtils.setField(testUser, "id", UUID.randomUUID());
    }

    @Test
    @DisplayName("Should return valid token and log audit attempt when login is successful")
    void login_ValidCredentials_ReturnsLoginResponse() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtService.generateToken(
                        testUser.getId(), testUser.getSubscriptionId(), testUser.getEmail(), testUser.getRole()))
                .thenReturn("mocked.jwt.token");

        SalduProperties.Jwt jwtProp = new SalduProperties.Jwt();
        jwtProp.setExpirationMs(3600000L);
        when(salduProperties.getJwt()).thenReturn(jwtProp);

        LoginResponse response = authService.login("test@saldu.com", "password123");

        assertThat(response.token()).isEqualTo("mocked.jwt.token");
        assertThat(response.tokenType()).isEqualTo("Bearer");

        verify(auditService).logLoginAttempt("test@saldu.com", true, null, testUser.getId());
    }

    @Test
    @DisplayName("Should throw BusinessException and log audit attempt when user is not found")
    void login_UserNotFound_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(() -> authService.login("test@saldu.com", "password123"));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        BusinessException ex = (BusinessException) thrown;
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(auditService).logLoginAttempt("test@saldu.com", false, "User not found", null);
    }

    @Test
    @DisplayName("Should throw BusinessException with registration pending when access request is pending")
    void login_RegistrationPending_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("pending@saldu.com")).thenReturn(Optional.empty());
        when(accessRequestRepository.existsByEmailAndStatus("pending@saldu.com", AccessRequestStatus.PENDING))
                .thenReturn(true);

        Throwable thrown = catchThrowable(() -> authService.login("pending@saldu.com", "password123"));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        BusinessException ex = (BusinessException) thrown;
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(ex.getCode()).isEqualTo("auth.registration_pending");

        verify(auditService).logLoginAttempt("pending@saldu.com", false, "Registration pending approval", null);
    }

    @Test
    @DisplayName("Should throw BusinessException and log audit attempt when password is invalid")
    void login_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "hashedPassword")).thenReturn(false);

        Throwable thrown = catchThrowable(() -> authService.login("test@saldu.com", "wrongpassword"));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        BusinessException ex = (BusinessException) thrown;
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(auditService).logLoginAttempt("test@saldu.com", false, "Invalid password", testUser.getId());
    }

    @Test
    @DisplayName("Should revoke token successfully when logging out")
    void logout_ValidToken_RevokesToken() {
        String token = "mocked.jwt.token";
        when(revokedTokenRepository.existsByToken(token)).thenReturn(false);

        authService.logout(token);

        verify(revokedTokenRepository).save(any(RevokedToken.class));
    }

    @Test
    @DisplayName("Should ignore already revoked token during logout")
    void logout_AlreadyRevoked_DoesNothing() {
        String token = "mocked.jwt.token";
        when(revokedTokenRepository.existsByToken(token)).thenReturn(true);

        authService.logout(token);

        verify(revokedTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should ignore empty or null token during logout")
    void logout_EmptyToken_DoesNothing() {
        authService.logout(null);
        authService.logout("");
        authService.logout("   ");

        verify(revokedTokenRepository, never()).existsByToken(any());
        verify(revokedTokenRepository, never()).save(any());
    }
}
