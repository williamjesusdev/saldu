package com.saldu.domain.user.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InviteTokenTest {

    @Test
    @DisplayName("Should create valid invite token")
    void create_ValidData_ReturnsInviteToken() {
        UUID adminId = UUID.randomUUID();
        InviteToken token = InviteToken.create(adminId, "test@test.com", 7);

        assertThat(token.getToken()).isNotNull();
        assertThat(token.getEmail()).isEqualTo("test@test.com");
        assertThat(token.getCreatedBy()).isEqualTo(adminId);
        assertThat(token.isExpired()).isFalse();
        assertThat(token.isUsed()).isFalse();
        assertThat(token.isValid()).isTrue();
    }

    @Test
    @DisplayName("Should mark token as used")
    void markAsUsed_ValidToken_MarksAsUsed() {
        InviteToken token = InviteToken.create(UUID.randomUUID(), "test@test.com", 7);
        UUID userId = UUID.randomUUID();

        token.markAsUsed(userId);

        assertThat(token.isUsed()).isTrue();
        assertThat(token.getUsedBy()).isEqualTo(userId);
        assertThat(token.isValid()).isFalse();

        Throwable thrown = catchThrowable(() -> token.markAsUsed(userId));
        assertThat(thrown).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Should fail to mark expired token as used")
    void markAsUsed_ExpiredToken_ThrowsException() {
        InviteToken token = InviteToken.create(UUID.randomUUID(), "test@test.com", -1); // already expired
        assertThat(token.isExpired()).isTrue();
        assertThat(token.isValid()).isFalse();

        Throwable thrown = catchThrowable(() -> token.markAsUsed(UUID.randomUUID()));
        assertThat(thrown).isInstanceOf(IllegalStateException.class);
    }
}
