package com.saldu.presentation._internal;

import java.util.Map;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saldu.domain.user.model.PasswordResetToken;
import com.saldu.domain.user.repository.PasswordResetTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Profile({"test", "e2e"})
@RequestMapping("/api/v1/_internal/e2e")
public class InternalE2EController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;

    @GetMapping("/password/reset/token")
    public ResponseEntity<Map<String, String>> getLatestPasswordResetToken(@RequestParam String email) {
        Optional<PasswordResetToken> tokenOpt = userRepository
                .findByEmailAndDeletedAtIsNull(email)
                .map(user -> resetTokenRepository
                        .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                        .orElse(null));

        if (tokenOpt.isEmpty()) {
            throw new BusinessException("auth.invalid_token", HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok(Map.of("token", tokenOpt.get().getToken()));
    }
}
