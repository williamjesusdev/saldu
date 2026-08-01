package com.saldu.application.user;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.domain.user.model.User;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getUserProfile(UUID userId) {
        return handleUserAuth(userId);
    }

    @Transactional
    public void giveConsent(UUID userId) {
        User user = handleUserAuth(userId);
        user.recordConsent();
        userRepository.save(user);
    }

    @Transactional
    public void softDeleteAccount(UUID userId) {
        User user = handleUserAuth(userId);
        user.softDelete();
        userRepository.save(user);
    }

    private User handleUserAuth(UUID userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException("auth.invalid_credentials", HttpStatus.NOT_FOUND));
    }
}
