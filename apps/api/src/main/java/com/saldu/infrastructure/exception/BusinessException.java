package com.saldu.infrastructure.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

public class BusinessException extends RuntimeException {

    @Getter
    private final String code;

    @Getter
    private final HttpStatus status;

    @Getter
    private final transient Object[] args;

    public BusinessException(String code, HttpStatus status, Object... args) {
        super(code);
        this.code = code;
        this.status = status;
        this.args = args.clone();
    }
}
