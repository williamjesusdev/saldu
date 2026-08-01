package com.saldu.presentation.admin.dto;

import jakarta.validation.constraints.Email;

import org.springframework.util.StringUtils;

public record CreateInviteRequest(
        @Email(message = "{validation.email.invalid}") String email) {

    public CreateInviteRequest {
        if (StringUtils.hasText(email)) {
            email = email.trim().toLowerCase();
        }
    }
}
