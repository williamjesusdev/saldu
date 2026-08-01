package com.saldu.domain.user.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PasswordResetTokenTest {

    @Test
    @DisplayName("Should create valid password reset token")
    void create_ValidData_ReturnsToken() {
        UUID userId = UUID.randomUUID();
        PasswordResetToken token = PasswordResetToken.create(userId, 2);

        assertThat(token.getToken()).isNotNull();
        assertThat(token.getUserId()).isEqualTo(userId);
        assertThat(token.isExpired()).isFalse();
        assertThat(token.isUsed()).isFalse();
        assertThat(token.isValidForUser(userId)).isTrue();
        assertThat(token.isValidForUser(UUID.randomUUID())).isFalse();
    }

    @Test
    @DisplayName("Should mark token as used")
    void markAsUsed_ValidToken_MarksAsUsed() {
        PasswordResetToken token = PasswordResetToken.create(UUID.randomUUID(), 2);
        token.markAsUsed();

        assertThat(token.isUsed()).isTrue();
        assertThat(token.isValidForUser(token.getUserId())).isFalse();

        Throwable thrown = catchThrowable(token::markAsUsed);
        assertThat(thrown).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Should fail to mark expired token as used")
    void markAsUsed_ExpiredToken_ThrowsException() {
        PasswordResetToken token = PasswordResetToken.create(UUID.randomUUID(), -1); // already expired
        assertThat(token.isExpired()).isTrue();
        assertThat(token.isValidForUser(token.getUserId())).isFalse();

        Throwable thrown = catchThrowable(token::markAsUsed);
        assertThat(thrown).isInstanceOf(IllegalStateException.class);
    }
}
