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

import com.saldu.domain.user.model.PasswordResetToken;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.PasswordResetTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordService passwordService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.create(UUID.randomUUID(), "Test User", "test@saldu.com", "oldHash", UserRole.USER);
        ReflectionTestUtils.setField(testUser, "id", userId);
    }

    @Test
    @DisplayName("Should save reset token when user exists")
    void requestPasswordReset_UserExists_SavesResetToken() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(resetTokenRepository.save(any())).thenReturn(null);

        String result = passwordService.requestPasswordReset("test@saldu.com");

        assertThat(result).isNotNull();
        verify(resetTokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Should silently handle reset request when user does not exist")
    void requestPasswordReset_UserDoesNotExist_DoesNothing() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test-nobody@saldu.com"))
                .thenReturn(Optional.empty());

        String result = passwordService.requestPasswordReset("test-nobody@saldu.com");

        assertThat(result).isNotNull();
        verify(resetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should verify and reset password successfully when token is valid")
    void verifyAndResetPassword_ValidToken_ResetsPassword() {
        PasswordResetToken mockToken = PasswordResetToken.create(testUser.getId(), 2);
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(resetTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");

        String result = passwordService.verifyAndResetPassword("test@saldu.com", mockToken.getToken(), "newPassword");

        assertThat(result).isNotNull();
        assertThat(mockToken.isUsed()).isTrue();
        verify(userRepository).save(testUser);
        verify(resetTokenRepository).save(mockToken);
    }

    @Test
    @DisplayName("Should change password successfully when current password matches")
    void changePassword_ValidCurrentPassword_UpdatesPassword() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "oldHash")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");

        String result = passwordService.changePassword(userId, "oldPassword", "newPassword");

        assertThat(result).isNotNull();
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw BusinessException when current password is wrong")
    void changePassword_WrongPassword_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "oldHash")).thenReturn(false);

        Throwable thrown = catchThrowable(() -> passwordService.changePassword(userId, "wrongPassword", "newPassword"));

        assertThat(thrown).isInstanceOf(BusinessException.class);
        assertThat(((BusinessException) thrown).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when user is not found during reset")
    void verifyAndResetPassword_UserNotFound_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.empty());

        Throwable thrown =
                catchThrowable(() -> passwordService.verifyAndResetPassword("test@saldu.com", "token", "newPassword"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when reset token is not found")
    void verifyAndResetPassword_TokenNotFound_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(resetTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(
                () -> passwordService.verifyAndResetPassword("test@saldu.com", "invalid-token", "newPassword"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when reset token belongs to a different user")
    void verifyAndResetPassword_InvalidForUser_ThrowsException() {
        PasswordResetToken mockToken = PasswordResetToken.create(UUID.randomUUID(), 2);
        when(userRepository.findByEmailAndDeletedAtIsNull("test@saldu.com")).thenReturn(Optional.of(testUser));
        when(resetTokenRepository.findByToken(mockToken.getToken())).thenReturn(Optional.of(mockToken));

        Throwable thrown = catchThrowable(
                () -> passwordService.verifyAndResetPassword("test@saldu.com", mockToken.getToken(), "newPassword"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_token")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should throw BusinessException when user is not found during password change")
    void changePassword_UserNotFound_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(() -> passwordService.changePassword(userId, "oldPassword", "newPassword"));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_credentials")
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
    }
}
