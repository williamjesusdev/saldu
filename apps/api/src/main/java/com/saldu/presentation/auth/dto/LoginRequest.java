package com.saldu.presentation.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "{validation.email.not_blank}") @Email(message = "{validation.email.invalid}")
        String email,

        @NotBlank(message = "{validation.password.not_blank}")
        String password) {}
