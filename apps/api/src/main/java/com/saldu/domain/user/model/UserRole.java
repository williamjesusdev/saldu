package com.saldu.domain.user.model;

public enum UserRole {
    USER,
    PLATFORM_ADMIN;

    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
