package com.saldu.application.account.dto;

import java.math.BigDecimal;

import com.saldu.domain.account.model.AccountType;

public record UpdateAccountCommand(
        String name,
        String institution,
        AccountType type,
        BigDecimal initialBalance,
        BigDecimal creditLimit,
        Boolean ignoreInTotals,
        Boolean investmentAccount) {}
