package com.saldu.application.account;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saldu.application.account.dto.CreateAccountCommand;
import com.saldu.application.account.dto.UpdateAccountCommand;
import com.saldu.domain.account.model.Account;
import com.saldu.domain.account.repository.AccountRepository;
import com.saldu.infrastructure.exception.BusinessException;
import com.saldu.infrastructure.security.SubscriptionContextHolder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public List<Account> listAccounts() {
        return accountRepository.findAllByDeletedAtIsNull();
    }

    public Account getAccountById(UUID id) {
        return accountRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException("account.not_found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Account createAccount(CreateAccountCommand command) {
        UUID subscriptionId = Objects.requireNonNull(
                SubscriptionContextHolder.getSubscriptionId(), "Subscription context is missing");

        Account.AccountOptions options =
                new Account.AccountOptions(command.ignoreInTotals(), command.investmentAccount());

        Account account = Account.create(
                subscriptionId,
                command.name(),
                command.institution(),
                command.type(),
                command.initialBalance(),
                command.creditLimit(),
                options);

        return accountRepository.save(account);
    }

    @Transactional
    public Account updateAccount(UUID id, UpdateAccountCommand command) {
        Account account = getAccountById(id);
        Account.AccountOptions options = new Account.AccountOptions(
                Objects.requireNonNullElse(command.ignoreInTotals(), account.isIgnoreInTotals()),
                Objects.requireNonNullElse(command.investmentAccount(), account.isInvestmentAccount()));

        account.update(
                command.name(),
                command.institution(),
                command.type(),
                command.initialBalance(),
                command.creditLimit(),
                options);

        return accountRepository.save(account);
    }

    @Transactional
    public void softDeleteAccount(UUID id) {
        Account account = getAccountById(id);
        account.softDelete();
        accountRepository.save(account);
    }
}
