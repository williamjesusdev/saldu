package com.saldu.domain.user.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.AccessRequestStatus;

public interface AccessRequestRepository extends JpaRepository<AccessRequest, UUID> {
    boolean existsByEmailAndStatus(String email, AccessRequestStatus status);
}
