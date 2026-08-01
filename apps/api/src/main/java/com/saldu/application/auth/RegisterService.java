package com.saldu.application.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.application.auth.dto.AccessRequestResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.domain.user.model.AccessRequest;
import com.saldu.domain.user.model.AccessRequestStatus;
import com.saldu.domain.user.model.InviteToken;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.AccessRequestRepository;
import com.saldu.domain.user.repository.InviteTokenRepository;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final InviteTokenRepository inviteTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AccessRequestResponse registerAccessRequest(String name, String email, String password) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(email)
                || accessRequestRepository.existsByEmailAndStatus(email, AccessRequestStatus.PENDING)) {
            throw new BusinessException("auth.email_already_exists", HttpStatus.CONFLICT);
        }

        AccessRequest accessRequest = accessRequestRepository.save(AccessRequest.createPending(name, email));

        return new AccessRequestResponse(accessRequest.getId(), accessRequest.getEmail(), accessRequest.getStatus());
    }

    @Transactional
    public UserResponse acceptInvite(String name, String email, String password, String token) {
        InviteToken inviteToken = inviteTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST));

        if (!inviteToken.isValid()) {
            throw new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST);
        }

        if (inviteToken.getEmail() != null && !inviteToken.getEmail().equalsIgnoreCase(email)) {
            throw new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new BusinessException("auth.email_already_exists", HttpStatus.BAD_REQUEST);
        }

        Subscription subscription = subscriptionRepository.save(Subscription.createFree());

        User user = userRepository.save(
                User.create(subscription.getId(), name, email, passwordEncoder.encode(password), UserRole.USER));

        inviteToken.markAsUsed(user.getId());
        inviteTokenRepository.save(inviteToken);

        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.hasGivenConsent());
    }
}
