package com.saldu.infrastructure.config;

import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SalduProperties properties;

    @Override
    @Transactional
    public void run(String @NonNull ... args) {
        String adminEmail = properties.getAdmin().getEmail();
        String adminPassword = properties.getAdmin().getPassword();
        String adminName = properties.getAdmin().getName();

        if (userRepository.existsByEmailAndDeletedAtIsNull(adminEmail)) {
            log.info("PLATFORM_ADMIN already exists. Skipping bootstrap.");
            return;
        }

        log.info(
                "Bootstrapping initial PLATFORM_ADMIN user: {} with password: {}",
                adminEmail,
                adminPassword.substring(0, 4) + "****");

        Subscription subscription = subscriptionRepository.save(Subscription.createFree());

        User admin = User.create(
                subscription.getId(),
                adminName,
                adminEmail,
                passwordEncoder.encode(adminPassword),
                UserRole.PLATFORM_ADMIN);

        userRepository.save(admin);
        log.info("Initial PLATFORM_ADMIN created successfully.");
    }
}
