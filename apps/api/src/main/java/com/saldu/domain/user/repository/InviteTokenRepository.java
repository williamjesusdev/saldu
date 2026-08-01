package com.saldu.domain.user.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saldu.domain.user.model.InviteToken;

public interface InviteTokenRepository extends JpaRepository<InviteToken, UUID> {
    Optional<InviteToken> findByToken(String token);

    @Query(
            "SELECT t FROM InviteToken t WHERE :isUsed IS NULL OR (:isUsed = true AND t.usedAt IS NOT NULL) OR (:isUsed = false AND t.usedAt IS NULL)")
    Page<InviteToken> findAllByUsedStatus(@Param("isUsed") Boolean isUsed, Pageable pageable);

    boolean existsByEmailAndUsedAtIsNullAndExpiresAtAfter(String email, Instant now);
}
