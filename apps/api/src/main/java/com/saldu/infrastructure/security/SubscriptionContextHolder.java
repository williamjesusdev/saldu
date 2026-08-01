package com.saldu.infrastructure.security;

import java.util.UUID;

public final class SubscriptionContextHolder {

    private static final ThreadLocal<UUID> CONTEXT = new ThreadLocal<>();

    private SubscriptionContextHolder() {
        // private constructor
    }

    public static UUID getSubscriptionId() {
        return CONTEXT.get();
    }

    public static void setSubscriptionId(UUID subscriptionId) {
        CONTEXT.set(subscriptionId);
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
