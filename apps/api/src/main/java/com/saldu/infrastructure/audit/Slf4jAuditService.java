package com.saldu.infrastructure.audit;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.saldu.application.audit.AuditService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class Slf4jAuditService implements AuditService {

    @Override
    public void logLoginAttempt(String email, boolean success, String reason, UUID userId) {
        String info = userId != null ? userId.toString() : email;
        if (success) {
            log.info("LOGIN_SUCCESS: User {} logged in successfully.", info);
        } else {
            log.warn("LOGIN_FAILURE: Attempt for email {} failed. Reason: {}", email, reason);
        }
    }
}
