package com.saldu.application.account.dto;

import java.math.BigDecimal;

import com.saldu.domain.account.model.AccountType;

public record CreateAccountCommand(
        String name,
        String institution,
        AccountType type,
        BigDecimal initialBalance,
        BigDecimal creditLimit,
        boolean ignoreInTotals,
        boolean investmentAccount) {}
