package com.saldu.presentation.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import com.saldu.infrastructure.validation.ValidPassword;

public record RegisterRequest(
        @NotBlank(message = "{validation.name.not_blank}") String name,

        @NotBlank(message = "{validation.email.not_blank}") @Email(message = "{validation.email.invalid}")
        String email,

        @NotBlank(message = "{validation.password.not_blank}") @ValidPassword
        String password) {}
