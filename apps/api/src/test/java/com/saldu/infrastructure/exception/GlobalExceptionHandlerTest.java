package com.saldu.infrastructure.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Locale;
import java.util.Objects;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setUseCodeAsDefaultMessage(true);
        exceptionHandler = new GlobalExceptionHandler(messageSource);
    }

    @Test
    @DisplayName("Should handle BusinessException and return RFC 9457 ProblemDetail")
    void handleBusinessException_BusinessException_ReturnsProblemDetail() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        BusinessException ex = new BusinessException("auth.invalid_credentials", HttpStatus.UNAUTHORIZED, "");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleBusinessException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(401);
        assertThat(Objects.requireNonNull(body.getInstance()).toString()).isEqualTo("/api/v1/auth/login");
    }

    @Test
    @DisplayName("Should handle MethodArgumentNotValidException")
    void handleValidationException_MethodArgumentNotValidException_ReturnsProblemDetail() throws Exception {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/test");

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");
        bindingResult.addError(new FieldError("object", "field", "must not be blank"));

        MethodParameter parameter = new MethodParameter(
                this.getClass()
                        .getDeclaredMethod(
                                "handleValidationException_MethodArgumentNotValidException_ReturnsProblemDetail"),
                -1);

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(400);
        assertThat(Objects.requireNonNull(body.getInstance()).toString()).isEqualTo("/api/test");
    }

    @Test
    @DisplayName("Should handle AuthenticationException")
    void handleAuthenticationException_AuthenticationException_ReturnsProblemDetail() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin");
        AuthenticationException ex = new UsernameNotFoundException("Authentication Failed");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleAuthenticationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(401);
        assertThat(Objects.requireNonNull(body.getInstance()).toString()).isEqualTo("/api/admin");
    }

    @Test
    @DisplayName("Should handle AccessDeniedException")
    void handleAccessDenied_AccessDeniedException_ReturnsProblemDetail() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin");
        AccessDeniedException ex = new AccessDeniedException("Access Denied");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(403);
        assertThat(Objects.requireNonNull(body.getInstance()).toString()).isEqualTo("/api/admin");
    }

    @Test
    @DisplayName("Should handle Generic Exception")
    void handleGenericException_Exception_ReturnsProblemDetail() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/error");
        Exception ex = new Exception("Unexpected error");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(500);
        assertThat(Objects.requireNonNull(body.getInstance()).toString()).isEqualTo("/api/error");
    }
}
