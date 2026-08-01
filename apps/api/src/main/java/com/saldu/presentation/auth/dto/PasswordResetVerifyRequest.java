package com.saldu.presentation.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import com.saldu.infrastructure.validation.ValidPassword;

public record PasswordResetVerifyRequest(
        @NotBlank(message = "{validation.email.not_blank}") @Email(message = "{validation.email.invalid}")
        String email,

        @NotBlank(message = "{validation.token.not_blank}") String token,

        @NotBlank(message = "{validation.password.not_blank}") @ValidPassword
        String password) {}
