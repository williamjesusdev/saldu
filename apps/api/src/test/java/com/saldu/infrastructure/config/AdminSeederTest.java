package com.saldu.infrastructure.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminSeederTest {

    private final String adminName = "Platform Admin";
    private final String adminEmail = "admin@saldu.com";
    private final String adminPassword = "Admin123!";

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SalduProperties properties;

    @InjectMocks
    private AdminSeeder adminSeeder;

    @BeforeEach
    void setUp() {
        SalduProperties.Admin adminProps = new SalduProperties.Admin();
        adminProps.setEmail(adminEmail);
        adminProps.setPassword(adminPassword);
        adminProps.setName(adminName);
        when(properties.getAdmin()).thenReturn(adminProps);
    }

    @Test
    @DisplayName("Should create admin user when it does not exist")
    void run_AdminNotExists_CreatesAdmin() {
        when(userRepository.existsByEmailAndDeletedAtIsNull(adminEmail)).thenReturn(false);
        when(passwordEncoder.encode(adminPassword)).thenReturn("encodedPassword");

        Subscription subscription = Subscription.createFree();
        ReflectionTestUtils.setField(subscription, "id", UUID.randomUUID());
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(subscription);

        adminSeeder.run();

        verify(subscriptionRepository).save(any(Subscription.class));
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode(adminPassword);
    }

    @Test
    @DisplayName("Should not create admin user when it already exists")
    void run_AdminExists_DoesNothing() {
        when(userRepository.existsByEmailAndDeletedAtIsNull(adminEmail)).thenReturn(true);

        adminSeeder.run();

        verify(subscriptionRepository, never()).save(any(Subscription.class));
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}
