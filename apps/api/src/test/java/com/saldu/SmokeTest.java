package com.saldu;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(useMainMethod = SpringBootTest.UseMainMethod.ALWAYS)
class SmokeTest extends IntegrationTestBase {

    @Test
    void contextLoads() {
        assertDoesNotThrow(() -> {});
    }
}
