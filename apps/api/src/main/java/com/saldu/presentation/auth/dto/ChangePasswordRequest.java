package com.saldu.presentation.auth.dto;

import jakarta.validation.constraints.NotBlank;

import com.saldu.infrastructure.validation.ValidPassword;

public record ChangePasswordRequest(
        @NotBlank(message = "{validation.current_password.not_blank}")
        String currentPassword,

        @NotBlank(message = "{validation.password.not_blank}") @ValidPassword
        String newPassword) {}
