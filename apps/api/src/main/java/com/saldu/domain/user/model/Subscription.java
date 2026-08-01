package com.saldu.domain.user.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Builder
@Table(name = "subscriptions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public static Subscription createFree() {
        return Subscription.builder()
                .plan(SubscriptionPlan.FREE)
                .createdAt(Instant.now())
                .build();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        if (isDeleted()) {
            throw new IllegalStateException("Subscription is already deleted.");
        }
        this.deletedAt = Instant.now();
    }
}
