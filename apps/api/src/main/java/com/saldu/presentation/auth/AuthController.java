package com.saldu.presentation.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saldu.application.auth.AuthService;
import com.saldu.application.auth.PasswordService;
import com.saldu.application.auth.RegisterService;
import com.saldu.application.auth.dto.AccessRequestResponse;
import com.saldu.application.auth.dto.LoginResponse;
import com.saldu.application.common.dto.MessageResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.infrastructure.security.JwtService;
import com.saldu.presentation.auth.dto.AcceptInviteRequest;
import com.saldu.presentation.auth.dto.LoginRequest;
import com.saldu.presentation.auth.dto.PasswordResetRequest;
import com.saldu.presentation.auth.dto.PasswordResetVerifyRequest;
import com.saldu.presentation.auth.dto.RegisterRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final RegisterService registerService;
    private final AuthService authService;
    private final PasswordService passwordService;
    private final MessageSource messageSource;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AccessRequestResponse> register(@Valid @RequestBody RegisterRequest request) {
        AccessRequestResponse result =
                registerService.registerAccessRequest(request.name(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/invite/accept")
    public ResponseEntity<UserResponse> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        UserResponse result =
                registerService.acceptInvite(request.name(), request.email(), request.password(), request.token());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.email(), request.password());
        ResponseCookie cookie = ResponseCookie.from(jwtService.getCookieName(), response.token())
                .httpOnly(true)
                .path("/")
                .maxAge(response.expiresIn())
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(jwtService.extractTokenFromRequest(request));
        ResponseCookie cookie = ResponseCookie.from(jwtService.getCookieName(), "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/password/reset")
    public ResponseEntity<MessageResponse> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        passwordService.requestPasswordReset(request.email());
        String message = messageSource.getMessage(
                "auth.password_reset_sent", null, "Password reset email sent", LocaleContextHolder.getLocale());
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/password/reset/verify")
    public ResponseEntity<MessageResponse> verifyPasswordReset(@Valid @RequestBody PasswordResetVerifyRequest request) {
        passwordService.verifyAndResetPassword(request.email(), request.token(), request.password());
        String message = messageSource.getMessage(
                "auth.password_reset_success", null, "Password reset successfully", LocaleContextHolder.getLocale());
        return ResponseEntity.ok(new MessageResponse(message));
    }
}
