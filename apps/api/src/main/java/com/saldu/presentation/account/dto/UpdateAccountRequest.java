package com.saldu.presentation.account.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import com.saldu.domain.account.model.AccountType;

public record UpdateAccountRequest(
        @Size(min = 2, max = 100, message = "{validation.name.size}")
        String name,

        @Size(max = 50, message = "{validation.institution.size}")
        String institution,

        AccountType type,

        @PositiveOrZero(message = "{validation.initial_balance.positive_or_zero}")
        BigDecimal initialBalance,

        @PositiveOrZero(message = "{validation.credit_limit.positive_or_zero}")
        BigDecimal creditLimit,

        Boolean ignoreInTotals,
        Boolean investmentAccount) {}
