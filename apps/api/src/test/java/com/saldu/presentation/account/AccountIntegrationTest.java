package com.saldu.presentation.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.saldu.IntegrationTestBase;
import com.saldu.domain.account.model.Account;
import com.saldu.domain.account.model.AccountType;
import com.saldu.domain.account.repository.AccountRepository;
import com.saldu.domain.user.model.Subscription;
import com.saldu.domain.user.model.User;
import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.SubscriptionRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.security.JwtService;
import com.saldu.presentation.account.dto.CreateAccountRequest;
import com.saldu.presentation.account.dto.UpdateAccountRequest;

@AutoConfigureMockMvc
class AccountIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String token;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        Subscription subscription = Subscription.createFree();
        subscription = subscriptionRepository.save(subscription);

        testUser = User.create(
                subscription.getId(),
                "Test User",
                "user@saldu.com",
                passwordEncoder.encode("CurrentPassword123!"),
                UserRole.USER);
        testUser = userRepository.save(testUser);

        token = jwtService.generateToken(
                testUser.getId(), subscription.getId(), testUser.getEmail(), testUser.getRole());

        testAccount = Account.create(
                subscription.getId(),
                "Test Bank",
                "Test Inst",
                AccountType.CHECKING,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                null);
        testAccount = accountRepository.save(testAccount);
    }

    @AfterEach
    void cleanup() {
        jdbcTemplate.execute("TRUNCATE TABLE accounts CASCADE");
        userRepository.deleteAll();
        subscriptionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should list accounts successfully")
    void listAccounts_ReturnsAccountList() throws Exception {
        mockMvc.perform(get("/api/v1/accounts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Bank"))
                .andExpect(jsonPath("$[0].institution").value("Test Inst"));
    }

    @Test
    @DisplayName("Should get account by ID successfully")
    void getAccountById_ExistingAccount_ReturnsAccount() throws Exception {
        mockMvc.perform(get("/api/v1/accounts/" + testAccount.getId()).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Bank"))
                .andExpect(jsonPath("$.institution").value("Test Inst"));
    }

    @Test
    @DisplayName("Should create account successfully")
    void createAccount_ValidRequest_ReturnsCreatedAccount() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest(
                "New Test Bank", "New Test Inst", AccountType.SAVINGS, BigDecimal.TEN, BigDecimal.ONE, false, false);

        mockMvc.perform(post("/api/v1/accounts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Test Bank"))
                .andExpect(jsonPath("$.institution").value("New Test Inst"))
                .andExpect(jsonPath("$.type").value("SAVINGS"));
    }

    @Test
    @DisplayName("Should update account successfully")
    void updateAccount_ValidRequest_UpdatesAccount() throws Exception {
        UpdateAccountRequest request = new UpdateAccountRequest(
                "Updated Test Bank",
                "Updated Test Inst",
                AccountType.INVESTMENT,
                BigDecimal.TEN,
                BigDecimal.ONE,
                true,
                true);

        mockMvc.perform(put("/api/v1/accounts/" + testAccount.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Test Bank"))
                .andExpect(jsonPath("$.institution").value("Updated Test Inst"))
                .andExpect(jsonPath("$.type").value("INVESTMENT"));

        Account updatedAccount = accountRepository.findById(testAccount.getId()).orElseThrow();
        assertThat(updatedAccount.getName()).isEqualTo("Updated Test Bank");
    }

    @Test
    @DisplayName("Should soft delete account successfully")
    void deleteAccount_ExistingAccount_SoftDeletesAccount() throws Exception {
        mockMvc.perform(delete("/api/v1/accounts/" + testAccount.getId()).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Account updatedAccount = accountRepository.findById(testAccount.getId()).orElseThrow();
        assertThat(updatedAccount.isDeleted()).isTrue();
    }
}
