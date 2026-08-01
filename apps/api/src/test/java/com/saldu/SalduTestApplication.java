package com.saldu;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.boot.SpringApplication;
import org.testcontainers.postgresql.PostgreSQLContainer;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SalduTestApplication {

    public static void main(String[] args) {
        // Obtém a instância do container PostgreSQL do IntegrationTestBase
        PostgreSQLContainer postgres = IntegrationTestBase.postgres;

        // Assegura que o container Singleton subiu
        postgres.start();

        try {
            // Escreve a URL real do Testcontainers no .env do Playwright
            String jdbcUrl = IntegrationTestBase.postgres.getJdbcUrl();
            String pgUserPass = postgres.getUsername() + ":" + postgres.getPassword() + "@";
            String pgUrl = jdbcUrl.replace("jdbc:postgresql://", "postgresql://" + pgUserPass)
                    .split("\\?")[0]; // Remove parâmetros de query, se houver

            Path projectRoot = Paths.get(System.getProperty("user.dir"));
            Path e2eEnvFile = projectRoot.resolve("../../tests/e2e/.env");

            if (!Files.exists(e2eEnvFile)) Files.createFile(e2eEnvFile);

            Files.writeString(e2eEnvFile, """
                    E2E_API_URL=http://localhost:8080
                    E2E_WEB_URL=http://localhost:3000
                    E2E_DATABASE_URL=%s
                    """.formatted(pgUrl));

            log.info("✅ [E2E] .env do Playwright atualizado com porta dinâmica!");
        } catch (Exception e) {
            log.error("❌ [E2E] Falha ao escrever .env do Playwright: " + e.getMessage());
        }

        // Injeta as propriedades do banco efêmero no contexto
        System.setProperty("spring.datasource.url", postgres.getJdbcUrl());
        System.setProperty("spring.datasource.username", postgres.getUsername());
        System.setProperty("spring.datasource.password", postgres.getPassword());

        // Força as propriedades para evitar que as variáveis de ambiente sejam sobrescritas durante os testes E2E
        System.setProperty("spring.profiles.active", "local,e2e");
        System.setProperty("saldu.jwt.secret", "saldu-super-secret-key-that-is-at-least-32-bytes-long-for-local!");
        System.setProperty("saldu.jwt.expiration-ms", "3600000");
        System.setProperty("saldu.jwt.cookie-name", "saldu-token");
        System.setProperty("saldu.admin.name", "E2E Test Admin");
        System.setProperty("saldu.admin.email", "e2e-admin@saldu.com");
        System.setProperty("saldu.admin.password", "E2eSecret!123");

        SpringApplication.run(SalduApplication.class, args);
    }
}
