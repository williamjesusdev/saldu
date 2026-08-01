package com.saldu.application.admin;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.application.admin.dto.InviteResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.InviteToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.presentation.admin.dto.InviteStatusFilter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminInviteService {

    private final InviteTokenRepository inviteTokenRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${saldu.auth.invite-token-validity-days}")
    private int inviteTokenValidityDays;

    @Transactional
    public InviteResponse createInvite(UUID adminUserId, String email) {
        if (email != null) {
            if (inviteTokenRepository.existsByEmailAndUsedAtIsNullAndExpiresAtAfter(email, Instant.now())) {
                throw new BusinessException("auth.invite_already_exists", HttpStatus.CONFLICT);
            }
            if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
                throw new BusinessException("auth.user_already_exists", HttpStatus.CONFLICT);
            }
        }

        InviteToken inviteToken =
                inviteTokenRepository.save(InviteToken.create(adminUserId, email, inviteTokenValidityDays));
        return new InviteResponse(
                inviteToken.getId(),
                inviteToken.getToken(),
                inviteToken.getEmail(),
                LocalDateTime.from(inviteToken.getExpiresAt().atZone(ZoneId.systemDefault())),
                inviteToken.isUsed());
    }

    public Page<InviteResponse> listInvites(int page, int size, InviteStatusFilter status) {
        Boolean isUsedFilter = status == null ? null : status == InviteStatusFilter.USED;
        Page<InviteToken> tokens = inviteTokenRepository.findAllByUsedStatus(isUsedFilter, PageRequest.of(page, size));

        return tokens.map(t -> new InviteResponse(
                t.getId(),
                t.getToken(),
                t.getEmail(),
                LocalDateTime.from(t.getExpiresAt().atZone(ZoneId.systemDefault())),
                t.isUsed()));
    }

    @Transactional
    public UserResponse approveAccessRequest(UUID adminUserId, UUID requestId) {
        AccessRequest request = accessRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST));

        Subscription subscription = subscriptionRepository.save(Subscription.createFree());

        String initialPassword = UUID.randomUUID().toString().substring(0, 8) + "A1";

        User user = userRepository.save(User.create(
                subscription.getId(),
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(initialPassword),
                UserRole.USER));

        request.approve(adminUserId);
        accessRequestRepository.save(request);

        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.hasGivenConsent());
    }

    @Transactional
    public void rejectAccessRequest(UUID adminUserId, UUID requestId, String reason) {
        AccessRequest request = accessRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST));

        request.reject(adminUserId, reason);
        accessRequestRepository.save(request);
    }
}
