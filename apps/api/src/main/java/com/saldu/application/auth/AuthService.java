package com.saldu.application.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.saldu.application.audit.AuditService;
import com.saldu.application.auth.dto.LoginResponse;
import com.saldu.domain.user.model.AccessRequestStatus;
import com.saldu.domain.user.model.RevokedToken;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.RevokedTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.config.SalduProperties;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.infrastructure.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final RevokedTokenRepository revokedTokenRepository;
    private final SalduProperties salduProperties;

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElseGet(() -> null);

        if (user == null) {
            if (accessRequestRepository.existsByEmailAndStatus(email, AccessRequestStatus.PENDING)) {
                auditService.logLoginAttempt(email, false, "Registration pending approval", null);
                throw new BusinessException("auth.registration_pending", HttpStatus.UNAUTHORIZED);
            }
            auditService.logLoginAttempt(email, false, "User not found", null);
            throw new BusinessException("auth.invalid_credentials", HttpStatus.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            auditService.logLoginAttempt(email, false, "Invalid password", user.getId());
            throw new BusinessException("auth.invalid_credentials", HttpStatus.UNAUTHORIZED);
        }

        String token =
                jwtService.generateToken(user.getId(), user.getSubscriptionId(), user.getEmail(), user.getRole());

        auditService.logLoginAttempt(email, true, null, user.getId());
        long expiresIn = salduProperties.getJwt().getExpirationMs() / 1000;

        return new LoginResponse("Bearer", token, (int) expiresIn);
    }

    public void logout(String token) {
        if (StringUtils.hasText(token)) {
            if (!revokedTokenRepository.existsByToken(token)) {
                revokedTokenRepository.save(RevokedToken.create(token));
            }
        }
    }
}
