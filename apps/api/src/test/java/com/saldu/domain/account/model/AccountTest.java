package com.saldu.domain.account.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AccountTest {

    @Test
    @DisplayName("Should create account with default values successfully")
    void create_ValidData_CreatesAccount() {
        UUID subId = UUID.randomUUID();
        Account account = Account.create(subId, "Test Bank", null, AccountType.CHECKING, null, null, null);

        assertThat(account.getSubscriptionId()).isEqualTo(subId);
        assertThat(account.getName()).isEqualTo("Test Bank");
        assertThat(account.getInstitution()).isEqualTo("OTHER");
        assertThat(account.getType()).isEqualTo(AccountType.CHECKING);
        assertThat(account.getInitialBalance()).isEqualTo(BigDecimal.ZERO);
        assertThat(account.getCreditLimit()).isEqualTo(BigDecimal.ZERO);
        assertThat(account.isIgnoreInTotals()).isFalse();
        assertThat(account.isInvestmentAccount()).isFalse();
        assertThat(account.getCreatedAt()).isNotNull();
        assertThat(account.getUpdatedAt()).isNotNull();
        assertThat(account.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("Should throw exception when creating with name too short")
    void create_NameTooShort_ThrowsException() {
        Throwable thrown = catchThrowable(
                () -> Account.create(UUID.randomUUID(), "A", null, AccountType.CHECKING, null, null, null));
        assertThat(thrown)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Account name must be between 2 and 100");
    }

    @Test
    @DisplayName("Should throw exception when creating with name too long")
    void create_NameTooLong_ThrowsException() {
        String longName = "A".repeat(101);
        Throwable thrown = catchThrowable(
                () -> Account.create(UUID.randomUUID(), longName, null, AccountType.CHECKING, null, null, null));
        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessageContaining("between 2 and 100");
    }

    @Test
    @DisplayName("Should throw exception when creating with institution too long")
    void create_InstitutionTooLong_ThrowsException() {
        String longInst = "B".repeat(51);
        Throwable thrown = catchThrowable(
                () -> Account.create(UUID.randomUUID(), "Bank", longInst, AccountType.CHECKING, null, null, null));
        assertThat(thrown)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not exceed 50 characters");
    }

    @Test
    @DisplayName("Should throw exception when creating with null subscriptionId")
    void create_NullSubscriptionId_ThrowsException() {
        Throwable thrown =
                catchThrowable(() -> Account.create(null, "Bank", null, AccountType.CHECKING, null, null, null));
        assertThat(thrown).isInstanceOf(NullPointerException.class).hasMessageContaining("Subscription ID is required");
    }

    @Test
    @DisplayName("Should throw exception when creating with null type")
    void create_NullType_ThrowsException() {
        Throwable thrown =
                catchThrowable(() -> Account.create(UUID.randomUUID(), "Bank", null, null, null, null, null));
        assertThat(thrown).isInstanceOf(NullPointerException.class).hasMessageContaining("Account Type is required");
    }

    @Test
    @DisplayName("Should update account fields successfully")
    void update_ValidData_UpdatesAccount() {
        Account.AccountOptions options = new Account.AccountOptions(true, true);
        Account account = Account.create(
                UUID.randomUUID(),
                "Old Test Bank",
                "Old Test Inst",
                AccountType.CHECKING,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                options);

        Account.AccountOptions updateOptions = new Account.AccountOptions(true, true);
        account.update("New Test Bank", null, AccountType.SAVINGS, BigDecimal.TEN, BigDecimal.ONE, updateOptions);

        assertThat(account.getName()).isEqualTo("New Test Bank");
        assertThat(account.getInstitution()).isEqualTo("Old Test Inst");
        assertThat(account.getType()).isEqualTo(AccountType.SAVINGS);
        assertThat(account.getInitialBalance()).isEqualTo(BigDecimal.TEN);
        assertThat(account.getCreditLimit()).isEqualTo(BigDecimal.ONE);
        assertThat(account.isIgnoreInTotals()).isTrue();
        assertThat(account.isInvestmentAccount()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when updating with name too short")
    void update_NameTooShort_ThrowsException() {
        Account account = Account.create(UUID.randomUUID(), "My Bank", null, AccountType.CHECKING, null, null, null);
        Throwable thrown = catchThrowable(() -> account.update("A", null, null, null, null, null));
        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessageContaining("between 2 and 100");
    }

    @Test
    @DisplayName("Should throw exception when updating with institution too long")
    void update_InstitutionTooLong_ThrowsException() {
        Account account = Account.create(UUID.randomUUID(), "My Bank", null, AccountType.CHECKING, null, null, null);
        String longInst = "C".repeat(51);
        Throwable thrown = catchThrowable(() -> account.update(null, longInst, null, null, null, null));
        assertThat(thrown)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not exceed 50 characters");
    }

    @Test
    @DisplayName("Should soft delete account successfully")
    void softDelete_ActiveAccount_SetsDeletedAt() {
        Account account = Account.create(UUID.randomUUID(), "Test Bank", null, AccountType.CHECKING, null, null, null);

        account.softDelete();

        assertThat(account.isDeleted()).isTrue();
        assertThat(account.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should throw exception when soft deleting already deleted account")
    void softDelete_AlreadyDeletedAccount_ThrowsException() {
        Account account = Account.create(UUID.randomUUID(), "My Bank", null, AccountType.CHECKING, null, null, null);
        account.softDelete();

        Throwable thrown = catchThrowable(account::softDelete);

        assertThat(thrown).isInstanceOf(IllegalStateException.class).hasMessageContaining("already deleted");
    }
}
