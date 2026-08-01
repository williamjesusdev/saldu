package com.saldu.application.auth;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.domain.user.model.PasswordResetToken;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.repository.PasswordResetTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${saldu.auth.password-reset-token-validity-hours}")
    private int passwordResetTokenValidityHours;

    @Transactional
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);

        if (user != null) {
            PasswordResetToken resetToken = PasswordResetToken.create(user.getId(), passwordResetTokenValidityHours);
            resetTokenRepository.save(resetToken);
        }

        return "E-mail de recuperação de senha enviado";
    }

    @Transactional
    public String verifyAndResetPassword(String email, String token, String newPassword) {
        User user = userRepository
                .findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST));

        PasswordResetToken resetToken = resetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST));

        if (!resetToken.isValidForUser(user.getId())) {
            throw new BusinessException("auth.invalid_token", HttpStatus.BAD_REQUEST);
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.markAsUsed();
        resetTokenRepository.save(resetToken);

        return "Senha resetada com sucesso";
    }

    @Transactional
    public String changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException("auth.invalid_credentials", HttpStatus.BAD_REQUEST));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException("auth.invalid_credentials", HttpStatus.BAD_REQUEST);
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Senha atualizada com sucesso";
    }
}
