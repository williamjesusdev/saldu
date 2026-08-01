package com.saldu.application.auth.dto;

import java.util.UUID;

import com.saldu.domain.user.model.AccessRequestStatus;

public record AccessRequestResponse(UUID requestId, String email, AccessRequestStatus status) {}
