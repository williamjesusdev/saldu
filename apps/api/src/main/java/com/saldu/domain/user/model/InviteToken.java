package com.saldu.domain.user.model;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Builder
@Table(name = "invite_tokens")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InviteToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column
    private String email;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "used_by")
    private UUID usedBy;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "used_at")
    private Instant usedAt;

    public static InviteToken create(UUID createdBy, String email, long validityDays) {
        return InviteToken.builder()
                .token(UUID.randomUUID().toString())
                .email(email)
                .createdBy(createdBy)
                .expiresAt(Instant.now().plus(validityDays, ChronoUnit.DAYS))
                .createdAt(Instant.now())
                .build();
    }

    public void markAsUsed(UUID userId) {
        if (isUsed()) {
            throw new IllegalStateException("Invite token has already been used.");
        }
        if (isExpired()) {
            throw new IllegalStateException("Invite token has expired.");
        }
        this.usedBy = userId;
        this.usedAt = Instant.now();
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !isUsed() && !isExpired();
    }
}
