package com.saldu.infrastructure.validation;

import java.util.Objects;
import java.util.regex.Pattern;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d).{8,}$");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        return PASSWORD_PATTERN
                .matcher(Objects.requireNonNullElse(password, ""))
                .matches();
    }
}
