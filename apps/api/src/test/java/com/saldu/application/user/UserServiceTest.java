package com.saldu.application.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
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

import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private User mockUser;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        mockUser = User.create(UUID.randomUUID(), "Test", "test@saldu.com", "pwd", UserRole.USER);
    }

    @Test
    @DisplayName("Should return user profile when user exists")
    void getUserProfile_UserExists_ReturnsUserProfile() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        User user = userService.getUserProfile(userId);

        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo("test@saldu.com");
    }

    @Test
    @DisplayName("Should throw BusinessException when user is not found during profile retrieval")
    void getUserProfile_UserNotFound_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(() -> userService.getUserProfile(userId));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("auth.invalid_credentials")
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("Should record user consent successfully")
    void giveConsent_UserExists_RecordsConsent() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        userService.giveConsent(userId);

        assertThat(mockUser.hasGivenConsent()).isTrue();
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("Should soft delete user account successfully")
    void softDeleteAccount_UserExists_SoftDeletesUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        userService.softDeleteAccount(userId);

        assertThat(mockUser.getDeletedAt()).isNotNull();
        verify(userRepository).save(mockUser);
    }
}
