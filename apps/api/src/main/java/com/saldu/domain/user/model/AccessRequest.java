package com.saldu.domain.user.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@Table(name = "access_requests")
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AccessRequestStatus status = AccessRequestStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public static AccessRequest createPending(String name, String email) {
        return AccessRequest.builder()
                .name(name)
                .email(email)
                .status(AccessRequestStatus.PENDING)
                .createdAt(Instant.now())
                .build();
    }

    public void approve(UUID adminUserId) {
        if (!isPending()) {
            throw new IllegalStateException("Cannot approve an access request that is not pending.");
        }
        this.status = AccessRequestStatus.APPROVED;
        this.reviewedBy = adminUserId;
        this.reviewedAt = Instant.now();
    }

    public void reject(UUID adminUserId) {
        reject(adminUserId, null);
    }

    public void reject(UUID adminUserId, String rejectionReason) {
        if (!isPending()) {
            throw new IllegalStateException("Cannot reject an access request that is not pending.");
        }
        this.status = AccessRequestStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.reviewedBy = adminUserId;
        this.reviewedAt = Instant.now();
    }

    public boolean isPending() {
        return this.status.isPending();
    }

    public boolean isApproved() {
        return this.status.isApproved();
    }

    public boolean isRejected() {
        return this.status.isRejected();
    }
}
