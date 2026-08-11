package com.saldu.application.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.saldu.application.account.dto.CreateAccountCommand;
import com.saldu.application.account.dto.UpdateAccountCommand;
import com.saldu.domain.account.model.Account;
import com.saldu.domain.account.model.AccountType;
import com.saldu.domain.account.repository.AccountRepository;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.infrastructure.security.SubscriptionContextHolder;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private UUID subscriptionId;
    private UUID accountId;
    private Account mockAccount;

    @BeforeEach
    void setUp() {
        subscriptionId = UUID.randomUUID();
        accountId = UUID.randomUUID();
        mockAccount = Account.create(
                subscriptionId, "Bank", "Inst", AccountType.CHECKING, BigDecimal.ZERO, BigDecimal.ZERO, null);

        SubscriptionContextHolder.setSubscriptionId(subscriptionId);
    }

    @AfterEach
    void tearDown() {
        SubscriptionContextHolder.clear();
    }

    @Test
    @DisplayName("Should create account successfully")
    void createAccount_ValidCommand_CreatesAccount() {
        CreateAccountCommand command = new CreateAccountCommand(
                "Bank", "Inst", AccountType.CHECKING, BigDecimal.ZERO, BigDecimal.ZERO, false, false);
        when(accountRepository.save(any(Account.class))).thenReturn(mockAccount);

        Account account = accountService.createAccount(command);

        assertThat(account).isNotNull();
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    @DisplayName("Should list accounts successfully")
    void listAccounts_ReturnsAccounts() {
        when(accountRepository.findAllByDeletedAtIsNull()).thenReturn(List.of(mockAccount));

        List<Account> accounts = accountService.listAccounts();

        assertThat(accounts).hasSize(1);
        verify(accountRepository).findAllByDeletedAtIsNull();
    }

    @Test
    @DisplayName("Should update account successfully")
    void updateAccount_AccountExists_UpdatesAccount() {
        UpdateAccountCommand command = new UpdateAccountCommand(
                "New Bank", "New Inst", AccountType.SAVINGS, BigDecimal.TEN, BigDecimal.ONE, true, true);
        when(accountRepository.findByIdAndDeletedAtIsNull(accountId)).thenReturn(Optional.of(mockAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(mockAccount);

        Account updated = accountService.updateAccount(accountId, command);

        assertThat(updated).isNotNull();
        assertThat(mockAccount.getName()).isEqualTo("New Bank");
        verify(accountRepository).save(mockAccount);
    }

    @Test
    @DisplayName("Should throw BusinessException when updating non-existent account")
    void updateAccount_AccountNotFound_ThrowsException() {
        UpdateAccountCommand command = new UpdateAccountCommand(
                "New Bank", "New Inst", AccountType.SAVINGS, BigDecimal.TEN, BigDecimal.ONE, true, true);
        when(accountRepository.findByIdAndDeletedAtIsNull(accountId)).thenReturn(Optional.empty());

        Throwable thrown = catchThrowable(() -> accountService.updateAccount(accountId, command));

        assertThat(thrown)
                .isInstanceOf(BusinessException.class)
                .hasMessage("account.not_found")
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("Should soft delete account successfully")
    void softDeleteAccount_AccountExists_SoftDeletes() {
        when(accountRepository.findByIdAndDeletedAtIsNull(accountId)).thenReturn(Optional.of(mockAccount));

        accountService.softDeleteAccount(accountId);

        assertThat(mockAccount.isDeleted()).isTrue();
        verify(accountRepository).save(mockAccount);
    }
}
