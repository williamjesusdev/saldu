package com.saldu.presentation.auth;

import java.util.UUID;
import jakarta.validation.Valid;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.saldu.application.auth.PasswordService;
import com.saldu.application.common.dto.MessageResponse;
import com.saldu.application.user.UserService;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.domain.user.model.User;
import com.saldu.presentation.auth.dto.ChangePasswordRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users/me")
public class MeController {

    private final UserService userService;
    private final PasswordService passwordService;
    private final MessageSource messageSource;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UUID userId) {
        User user = userService.getUserProfile(userId);
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.hasGivenConsent()));
    }

    @PostMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UUID userId, @Valid @RequestBody ChangePasswordRequest request) {
        passwordService.changePassword(userId, request.currentPassword(), request.newPassword());
        String message = messageSource.getMessage(
                "auth.password_updated_success",
                null,
                "Password updated successfully",
                LocaleContextHolder.getLocale());
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/consent")
    public ResponseEntity<Void> giveConsent(@AuthenticationPrincipal UUID userId) {
        userService.giveConsent(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> softDeleteAccount(@AuthenticationPrincipal UUID userId) {
        userService.softDeleteAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
