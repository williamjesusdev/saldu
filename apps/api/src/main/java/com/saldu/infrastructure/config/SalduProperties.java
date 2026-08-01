package com.saldu.infrastructure.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "saldu")
public class SalduProperties {

    @Valid
    @NotNull
    private Jwt jwt = new Jwt();

    @Valid
    @NotNull
    private Admin admin = new Admin();

    @Getter
    @Setter
    public static class Jwt {
        @NotBlank(message = "saldu.jwt.secret is required and cannot be blank")
        private String secret;

        @NotNull(message = "saldu.jwt.expiration-ms is required")
        private Long expirationMs;

        @NotBlank(message = "saldu.jwt.cookie-name is required and cannot be blank")
        private String cookieName;
    }

    @Getter
    @Setter
    public static class Admin {
        @NotBlank(message = "saldu.admin.email is required and cannot be blank")
        private String email;

        @NotBlank(message = "saldu.admin.password is required and cannot be blank")
        private String password;

        @NotBlank(message = "saldu.admin.name is required and cannot be blank")
        private String name;
    }
}
