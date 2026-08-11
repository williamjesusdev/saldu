package com.saldu.domain.account.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@Table(name = "accounts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "subscription_id", nullable = false)
    private UUID subscriptionId;

    @Column(nullable = false, length = 100)
    private String name;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String institution = "OTHER";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountType type;

    @Builder.Default
    @Column(name = "initial_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "credit_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "ignore_in_totals", nullable = false)
    private boolean ignoreInTotals = false;

    @Builder.Default
    @Column(name = "investment_account", nullable = false)
    private boolean investmentAccount = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public static class AccountOptions {
        private final boolean ignoreInTotals;
        private final boolean investmentAccount;

        public AccountOptions(boolean ignoreInTotals, boolean investmentAccount) {
            this.ignoreInTotals = ignoreInTotals;
            this.investmentAccount = investmentAccount;
        }
    }

    public static Account create(
            UUID subscriptionId,
            String name,
            String institution,
            AccountType type,
            BigDecimal initialBalance,
            BigDecimal creditLimit,
            AccountOptions options) {
        return Account.builder()
                .subscriptionId(Objects.requireNonNull(subscriptionId, "Subscription ID is required."))
                .name(validateName(name))
                .institution(validateInstitution(institution))
                .type(Objects.requireNonNull(type, "Account Type is required."))
                .initialBalance(Objects.requireNonNullElse(initialBalance, BigDecimal.ZERO))
                .creditLimit(Objects.requireNonNullElse(creditLimit, BigDecimal.ZERO))
                .ignoreInTotals(options != null && options.ignoreInTotals)
                .investmentAccount(options != null && options.investmentAccount)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    public void update(
            String name,
            String institution,
            AccountType type,
            BigDecimal initialBalance,
            BigDecimal creditLimit,
            AccountOptions options) {
        if (options != null) {
            this.ignoreInTotals = options.ignoreInTotals;
            this.investmentAccount = options.investmentAccount;
        }
        if (!Objects.requireNonNullElse(name, "").trim().isEmpty()) {
            this.name = validateName(name);
        }
        if (!Objects.requireNonNullElse(institution, "").trim().isEmpty()) {
            this.institution = validateInstitution(institution);
        }

        this.type = Objects.requireNonNullElse(type, this.type);
        this.initialBalance = Objects.requireNonNullElse(initialBalance, this.initialBalance);
        this.creditLimit = Objects.requireNonNullElse(creditLimit, this.creditLimit);
        this.updatedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        if (isDeleted()) {
            throw new IllegalStateException("Account is already deleted.");
        }
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    private static String validateName(String name) {
        String formatted = Objects.requireNonNullElse(name, "").trim();
        if (formatted.length() < 2 || formatted.length() > 100) {
            throw new IllegalArgumentException("Account name must be between 2 and 100 characters.");
        }
        return formatted;
    }

    private static String validateInstitution(String institution) {
        String formatted = Objects.requireNonNullElse(institution, "OTHER").trim();
        if (formatted.length() > 50) {
            throw new IllegalArgumentException("Institution must not exceed 50 characters.");
        }
        return formatted;
    }
}
