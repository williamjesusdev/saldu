package com.saldu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @SuppressWarnings("resource")
    static final PostgreSQLContainer postgres = new PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("saldu")
            .withUsername("saldu")
            .withPassword("saldu_2026");

    static {
        postgres.start();
    }

    @Autowired
    protected ObjectMapper objectMapper;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("saldu.jwt.secret", () -> "saldu-super-secret-key-that-is-at-least-32-bytes-long-for-local!");
        registry.add("saldu.jwt.expiration-ms", () -> "3600000");
        registry.add("saldu.jwt.cookie-name", () -> "saldu-token");
        registry.add("saldu.admin.name", () -> "Platform Test Admin");
        registry.add("saldu.admin.email", () -> "admin-test@saldu.com");
        registry.add("saldu.admin.password", () -> "AdminTest123!");
    }
}
