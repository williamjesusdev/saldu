package com.saldu.application.audit;

import java.util.UUID;

public interface AuditService {
    void logLoginAttempt(String email, boolean success, String reason, UUID userId);
}
