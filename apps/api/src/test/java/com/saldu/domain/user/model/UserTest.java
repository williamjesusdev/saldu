package com.saldu.domain.user.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    @DisplayName("Should create a user successfully")
    void create_ValidParameters_ReturnsUser() {
        UUID subscriptionId = UUID.randomUUID();
        User user = User.create(subscriptionId, "John Doe", "john@example.com", "hash123", UserRole.USER);

        assertThat(user.getSubscriptionId()).isEqualTo(subscriptionId);
        assertThat(user.getName()).isEqualTo("John Doe");
        assertThat(user.getEmail()).isEqualTo("john@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("hash123");
        assertThat(user.getRole()).isEqualTo(UserRole.USER);
        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.isDeleted()).isFalse();
        assertThat(user.hasGivenConsent()).isFalse();
    }

    @Test
    @DisplayName("Should create user with default role when role is null")
    void create_NullRole_ReturnsUserWithDefaultRole() {
        User user = User.create(UUID.randomUUID(), "Jane Doe", "jane@example.com", "hash", null);
        assertThat(user.getRole()).isEqualTo(UserRole.USER);
    }

    @Test
    @DisplayName("Should update user password successfully")
    void updatePassword_ValidHash_UpdatesPassword() {
        User user = User.create(UUID.randomUUID(), "Test", "test@example.com", "oldHash", UserRole.USER);

        user.updatePassword("newHash");

        assertThat(user.getPasswordHash()).isEqualTo("newHash");
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should record consent correctly")
    void recordConsent_ValidCall_UpdatesConsent() {
        User user = User.create(UUID.randomUUID(), "Test", "test@example.com", "hash", UserRole.USER);

        user.recordConsent();

        assertThat(user.hasGivenConsent()).isTrue();
        assertThat(user.getConsentGivenAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should soft delete user successfully")
    void softDelete_ValidUser_DeletesUser() {
        User user = User.create(UUID.randomUUID(), "Test", "test@example.com", "hash", UserRole.USER);

        user.softDelete();

        assertThat(user.isDeleted()).isTrue();
        assertThat(user.getDeletedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should throw exception when soft deleting an already deleted user")
    void softDelete_AlreadyDeleted_ThrowsException() {
        User user = User.create(UUID.randomUUID(), "Test", "test@example.com", "hash", UserRole.USER);
        user.softDelete();

        Throwable thrown = catchThrowable(user::softDelete);

        assertThat(thrown).isInstanceOf(IllegalStateException.class).hasMessage("User account is already deleted.");
    }
}
