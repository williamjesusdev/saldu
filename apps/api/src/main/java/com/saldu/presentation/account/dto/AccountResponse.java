package com.saldu.presentation.account.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.saldu.domain.account.model.Account;
import com.saldu.domain.account.model.AccountType;

public record AccountResponse(
        UUID id,
        String name,
        String institution,
        AccountType type,
        BigDecimal initialBalance,
        BigDecimal creditLimit,
        boolean ignoreInTotals,
        boolean investmentAccount) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getInstitution(),
                account.getType(),
                account.getInitialBalance(),
                account.getCreditLimit(),
                account.isIgnoreInTotals(),
                account.isInvestmentAccount());
    }
}
