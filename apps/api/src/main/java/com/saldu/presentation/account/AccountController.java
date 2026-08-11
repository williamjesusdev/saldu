package com.saldu.presentation.account;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saldu.application.account.AccountService;
import com.saldu.application.account.dto.CreateAccountCommand;
import com.saldu.application.account.dto.UpdateAccountCommand;
import com.saldu.domain.account.model.Account;
import com.saldu.presentation.account.dto.AccountResponse;
import com.saldu.presentation.account.dto.CreateAccountRequest;
import com.saldu.presentation.account.dto.UpdateAccountRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> listAccounts() {
        return ResponseEntity.ok(accountService.listAccounts().stream()
                .map(AccountResponse::from)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable UUID id) {
        return ResponseEntity.ok(AccountResponse.from(accountService.getAccountById(id)));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        CreateAccountCommand command = new CreateAccountCommand(
                request.name(),
                request.institution(),
                request.type(),
                request.initialBalance(),
                request.creditLimit(),
                request.ignoreInTotals(),
                request.investmentAccount());
        Account account = accountService.createAccount(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(account));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable UUID id, @Valid @RequestBody UpdateAccountRequest request) {
        UpdateAccountCommand command = new UpdateAccountCommand(
                request.name(),
                request.institution(),
                request.type(),
                request.initialBalance(),
                request.creditLimit(),
                request.ignoreInTotals(),
                request.investmentAccount());
        Account account = accountService.updateAccount(id, command);
        return ResponseEntity.ok(AccountResponse.from(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteAccount(@PathVariable UUID id) {
        accountService.softDeleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
