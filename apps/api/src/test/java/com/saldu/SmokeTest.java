package com.saldu;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;

class SmokeTest extends IntegrationTestBase {

    @Test
    void contextLoads() {
        assertDoesNotThrow(() -> {});
    }
}
