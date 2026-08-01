package com.saldu.domain.user.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum AccessRequestStatus {
    PENDING,
    APPROVED,
    REJECTED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isApproved() {
        return this == APPROVED;
    }

    public boolean isRejected() {
        return this == REJECTED;
    }
}
