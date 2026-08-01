package com.saldu.application.user.dto;

import java.util.UUID;

public record UserResponse(UUID id, String name, String email, String role, boolean hasConsented) {}
