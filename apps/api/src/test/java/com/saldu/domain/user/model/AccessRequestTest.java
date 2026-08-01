package com.saldu.domain.user.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AccessRequestTest {

    @Test
    @DisplayName("Should create pending request")
    void createPending_ValidData_ReturnsPendingRequest() {
        AccessRequest request = AccessRequest.createPending("John Doe", "john@example.com");

        assertThat(request.isPending()).isTrue();
        assertThat(request.isApproved()).isFalse();
        assertThat(request.isRejected()).isFalse();
    }

    @Test
    @DisplayName("Should approve request")
    void approve_PendingRequest_ApprovesRequest() {
        AccessRequest request = AccessRequest.createPending("John Doe", "john@example.com");
        UUID adminId = UUID.randomUUID();

        request.approve(adminId);

        assertThat(request.isApproved()).isTrue();
        assertThat(request.getReviewedBy()).isEqualTo(adminId);
        assertThat(request.getReviewedAt()).isNotNull();

        Throwable approveThrown = catchThrowable(() -> request.approve(adminId));
        assertThat(approveThrown).isInstanceOf(IllegalStateException.class);

        Throwable rejectThrown = catchThrowable(() -> request.reject(adminId));
        assertThat(rejectThrown).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Should reject request")
    void reject_PendingRequest_RejectsRequest() {
        AccessRequest request = AccessRequest.createPending("Jane Doe", "jane@example.com");
        UUID adminId = UUID.randomUUID();

        request.reject(adminId);

        assertThat(request.isRejected()).isTrue();
        assertThat(request.getReviewedBy()).isEqualTo(adminId);
        assertThat(request.getReviewedAt()).isNotNull();

        Throwable rejectThrown = catchThrowable(() -> request.reject(adminId));
        assertThat(rejectThrown).isInstanceOf(IllegalStateException.class);

        Throwable approveThrown = catchThrowable(() -> request.approve(adminId));
        assertThat(approveThrown).isInstanceOf(IllegalStateException.class);
    }
}
