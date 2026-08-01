package com.saldu.domain.user.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "revoked_tokens")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RevokedToken {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "token", nullable = false, length = 1024, unique = true)
    private String token;

    @Column(name = "revoked_at", nullable = false)
    private Instant revokedAt;

    public static RevokedToken create(String token) {
        return new RevokedToken(UUID.randomUUID(), token, Instant.now());
    }
}
