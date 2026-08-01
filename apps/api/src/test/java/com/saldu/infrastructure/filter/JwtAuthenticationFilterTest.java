package com.saldu.infrastructure.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.RevokedTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.security.JwtService;
import com.saldu.infrastructure.security.SubscriptionContextHolder;

class JwtAuthenticationFilterTest {

    private JwtAuthenticationFilter filter;
    private JwtService jwtService;
    private UserRepository userRepository;
    private RevokedTokenRepository revokedTokenRepository;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        userRepository = mock(UserRepository.class);
        revokedTokenRepository = mock(RevokedTokenRepository.class);
        filter = new JwtAuthenticationFilter(jwtService, userRepository, revokedTokenRepository);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);
        SubscriptionContextHolder.clear();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SubscriptionContextHolder.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should extract token and set SubscriptionContext and SecurityContext during chain execution")
    void doFilterInternal_ValidJwt_SetsContexts() throws Exception {
        UUID expectedSubscriptionId = UUID.randomUUID();
        UUID expectedUserId = UUID.randomUUID();
        String expectedUserEmail = "test@saldu.com";
        UserRole expectedRole = UserRole.USER;

        when(jwtService.extractTokenFromRequest(request)).thenReturn("sample-valid-jwt");
        when(revokedTokenRepository.existsByToken("sample-valid-jwt")).thenReturn(false);
        when(jwtService.validateToken("sample-valid-jwt")).thenReturn(true);
        when(jwtService.extractSubscriptionId("sample-valid-jwt")).thenReturn(expectedSubscriptionId);
        when(jwtService.extractUserId("sample-valid-jwt")).thenReturn(expectedUserId);
        when(jwtService.extractEmail("sample-valid-jwt")).thenReturn(expectedUserEmail);
        when(jwtService.extractRole("sample-valid-jwt")).thenReturn(expectedRole);
        when(userRepository.existsByIdAndDeletedAtIsNull(expectedUserId)).thenReturn(true);

        doAnswer(invocation -> {
                    assertThat(SubscriptionContextHolder.getSubscriptionId()).isEqualTo(expectedSubscriptionId);
                    assertThat(SecurityContextHolder.getContext().getAuthentication())
                            .isNotNull();
                    assertThat(SecurityContextHolder.getContext()
                                    .getAuthentication()
                                    .getPrincipal())
                            .isEqualTo(expectedUserId);
                    return null;
                })
                .when(filterChain)
                .doFilter(request, response);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SubscriptionContextHolder.getSubscriptionId())
                .as("SubscriptionContext MUST be cleared after request")
                .isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication())
                .as("SecurityContext MUST be cleared after request")
                .isNull();
    }

    @Test
    @DisplayName(
            "Should extract token from cookie and set SubscriptionContext and SecurityContext during chain execution")
    void doFilterInternal_ValidCookieJwt_SetsContexts() throws Exception {
        UUID expectedSubscriptionId = UUID.randomUUID();
        UUID expectedUserId = UUID.randomUUID();
        String expectedUserEmail = "test@saldu.com";
        UserRole expectedRole = UserRole.USER;

        when(jwtService.extractTokenFromRequest(request)).thenReturn("sample-valid-jwt");
        when(revokedTokenRepository.existsByToken("sample-valid-jwt")).thenReturn(false);
        when(jwtService.validateToken("sample-valid-jwt")).thenReturn(true);
        when(jwtService.extractSubscriptionId("sample-valid-jwt")).thenReturn(expectedSubscriptionId);
        when(jwtService.extractUserId("sample-valid-jwt")).thenReturn(expectedUserId);
        when(jwtService.extractEmail("sample-valid-jwt")).thenReturn(expectedUserEmail);
        when(jwtService.extractRole("sample-valid-jwt")).thenReturn(expectedRole);
        when(userRepository.existsByIdAndDeletedAtIsNull(expectedUserId)).thenReturn(true);

        doAnswer(invocation -> {
                    assertThat(SubscriptionContextHolder.getSubscriptionId()).isEqualTo(expectedSubscriptionId);
                    assertThat(SecurityContextHolder.getContext().getAuthentication())
                            .isNotNull();
                    assertThat(SecurityContextHolder.getContext()
                                    .getAuthentication()
                                    .getPrincipal())
                            .isEqualTo(expectedUserId);
                    return null;
                })
                .when(filterChain)
                .doFilter(request, response);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SubscriptionContextHolder.getSubscriptionId())
                .as("SubscriptionContext MUST be cleared after request")
                .isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication())
                .as("SecurityContext MUST be cleared after request")
                .isNull();
    }

    @Test
    @DisplayName("Should clear contexts even if exception occurs in filter chain")
    void doFilterInternal_ExceptionInChain_ClearsContexts() throws Exception {
        UUID expectedSubscriptionId = UUID.randomUUID();
        UUID expectedUserId = UUID.randomUUID();

        when(jwtService.extractTokenFromRequest(request)).thenReturn("sample-valid-jwt");
        when(revokedTokenRepository.existsByToken("sample-valid-jwt")).thenReturn(false);
        when(jwtService.validateToken("sample-valid-jwt")).thenReturn(true);
        when(jwtService.extractSubscriptionId("sample-valid-jwt")).thenReturn(expectedSubscriptionId);
        when(jwtService.extractUserId("sample-valid-jwt")).thenReturn(expectedUserId);
        when(jwtService.extractRole("sample-valid-jwt")).thenReturn(UserRole.USER);
        when(userRepository.existsByIdAndDeletedAtIsNull(expectedUserId)).thenReturn(true);

        doThrow(new RuntimeException("Simulated filter error"))
                .when(filterChain)
                .doFilter(request, response);

        Throwable thrown = catchThrowable(() -> filter.doFilterInternal(request, response, filterChain));

        assertThat(thrown).isInstanceOf(RuntimeException.class);
        assertThat(SubscriptionContextHolder.getSubscriptionId())
                .as("SubscriptionContext MUST be cleared on exception")
                .isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication())
                .as("SecurityContext MUST be cleared on exception")
                .isNull();
    }

    @Test
    @DisplayName("Should bypass context setup when header is missing")
    void doFilterInternal_MissingHeader_BypassesSetup() throws Exception {
        when(jwtService.extractTokenFromRequest(request)).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should bypass context setup when token is invalid")
    void doFilterInternal_InvalidToken_BypassesSetup() throws Exception {
        when(jwtService.extractTokenFromRequest(request)).thenReturn("invalid-jwt");
        when(revokedTokenRepository.existsByToken("invalid-jwt")).thenReturn(false);
        when(jwtService.validateToken("invalid-jwt")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should set SecurityContext even if subscription is null")
    void doFilterInternal_NullSubscription_SetsSecurityContext() throws Exception {
        when(jwtService.extractTokenFromRequest(request)).thenReturn("sample-valid-jwt");
        when(revokedTokenRepository.existsByToken("sample-valid-jwt")).thenReturn(false);
        when(jwtService.validateToken("sample-valid-jwt")).thenReturn(true);
        UUID expectedUserId = UUID.randomUUID();
        when(jwtService.extractSubscriptionId("sample-valid-jwt")).thenReturn(null);
        when(jwtService.extractUserId("sample-valid-jwt")).thenReturn(expectedUserId);
        when(jwtService.extractRole("sample-valid-jwt")).thenReturn(UserRole.USER);
        when(userRepository.existsByIdAndDeletedAtIsNull(expectedUserId)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should bypass context setup when user is deleted or does not exist")
    void doFilterInternal_UserDeleted_BypassesSetup() throws Exception {
        UUID expectedUserId = UUID.randomUUID();
        when(jwtService.extractTokenFromRequest(request)).thenReturn("sample-valid-jwt");
        when(revokedTokenRepository.existsByToken("sample-valid-jwt")).thenReturn(false);
        when(jwtService.validateToken("sample-valid-jwt")).thenReturn(true);
        when(jwtService.extractUserId("sample-valid-jwt")).thenReturn(expectedUserId);
        when(userRepository.existsByIdAndDeletedAtIsNull(expectedUserId)).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should bypass context setup when token is in blocklist")
    void doFilterInternal_TokenBlocklisted_BypassesSetup() throws Exception {
        when(jwtService.extractTokenFromRequest(request)).thenReturn("revoked-jwt");
        when(revokedTokenRepository.existsByToken("revoked-jwt")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
