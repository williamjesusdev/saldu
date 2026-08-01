package com.saldu.domain.user.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SubscriptionTest {

    @Test
    @DisplayName("Should create free subscription")
    void createFree_ValidCall_ReturnsSubscription() {
        Subscription subscription = Subscription.createFree();

        assertThat(subscription.getPlan()).isEqualTo(SubscriptionPlan.FREE);
        assertThat(subscription.getCreatedAt()).isNotNull();
        assertThat(subscription.isDeleted()).isFalse();
    }

    @Test
    @DisplayName("Should soft delete subscription successfully")
    void softDelete_ValidSubscription_DeletesSubscription() {
        Subscription subscription = Subscription.createFree();

        subscription.softDelete();

        assertThat(subscription.isDeleted()).isTrue();
        assertThat(subscription.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should throw exception when soft deleting an already deleted subscription")
    void softDelete_AlreadyDeleted_ThrowsException() {
        Subscription subscription = Subscription.createFree();
        subscription.softDelete();

        Throwable thrown = catchThrowable(subscription::softDelete);

        assertThat(thrown).isInstanceOf(IllegalStateException.class).hasMessage("Subscription is already deleted.");
    }
}
