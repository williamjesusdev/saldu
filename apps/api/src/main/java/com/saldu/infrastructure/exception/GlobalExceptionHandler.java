package com.saldu.infrastructure.exception;

import java.net.URI;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    public static final URI TYPE_BLANK = URI.create("about:blank");

    private final MessageSource messageSource;

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusinessException(BusinessException ex, HttpServletRequest req) {
        Locale locale = LocaleContextHolder.getLocale();
        String titleKey = ex.getCode() + ".title";
        String detailKey = ex.getCode() + ".detail";

        String title = messageSource.getMessage(titleKey, ex.getArgs(), ex.getCode(), locale);
        String detail = messageSource.getMessage(detailKey, ex.getArgs(), ex.getCode(), locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(ex.getStatus(), detail);
        problemDetail.setTitle(title);
        problemDetail.setInstance(URI.create(req.getRequestURI()));
        problemDetail.setType(TYPE_BLANK);

        return ResponseEntity.status(ex.getStatus())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String messageKey = error.getDefaultMessage();
            String translatedMessage = messageSource.getMessage(messageKey, null, messageKey, locale);
            errors.put(error.getField(), translatedMessage);
        });

        String title = messageSource.getMessage("validation.error.title", null, "Validation Error", locale);
        String detail =
                messageSource.getMessage("validation.error.detail", null, "Validation failed for req body.", locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
        problemDetail.setTitle(title);
        problemDetail.setInstance(URI.create(req.getRequestURI()));
        problemDetail.setType(TYPE_BLANK);
        problemDetail.setProperty("errors", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetail);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest req) {
        Locale locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage("auth.unauthorized.title", null, "Unauthorized", locale);
        String detail = messageSource.getMessage("auth.unauthorized.detail", null, ex.getMessage(), locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, detail);
        problemDetail.setTitle(title);
        problemDetail.setInstance(URI.create(req.getRequestURI()));
        problemDetail.setType(TYPE_BLANK);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetail);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        Locale locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage("auth.access_denied.title", null, "Access Denied", locale);
        String detail = messageSource.getMessage("auth.access_denied.detail", null, ex.getMessage(), locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, detail);
        problemDetail.setTitle(title);
        problemDetail.setInstance(URI.create(req.getRequestURI()));
        problemDetail.setType(TYPE_BLANK);

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex, HttpServletRequest req) {
        Locale locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage("common.internal_error.title", null, "Internal Error", locale);
        String detail = messageSource.getMessage("common.internal_error.detail", null, ex.getMessage(), locale);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, detail);
        problemDetail.setTitle(title);
        problemDetail.setInstance(URI.create(req.getRequestURI()));
        problemDetail.setType(TYPE_BLANK);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetail);
    }
}
