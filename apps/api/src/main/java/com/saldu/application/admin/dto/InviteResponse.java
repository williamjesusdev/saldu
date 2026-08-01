package com.saldu.application.admin.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record InviteResponse(UUID id, String token, String email, LocalDateTime expiresAt, boolean used) {}
