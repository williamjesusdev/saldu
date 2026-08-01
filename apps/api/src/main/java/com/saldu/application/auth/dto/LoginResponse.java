package com.saldu.application.auth.dto;

public record LoginResponse(String tokenType, String token, int expiresIn) {}
