package com.saldu.infrastructure.filter;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class RateLimitFilterTest {

    private RateLimitFilter rateLimitFilter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;
    private StringWriter responseWriter;

    @BeforeEach
    void setUp() throws Exception {
        rateLimitFilter = new RateLimitFilter();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);
        responseWriter = new StringWriter();

        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
    }

    @Test
    @DisplayName("Should allow more than 5 requests per minute for the e2e profile")
    void doFilterInternal_E2EProfile_AllowsRequests() throws Exception {
        ReflectionTestUtils.setField(rateLimitFilter, "activeProfiles", "e2e");
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");

        for (int i = 0; i < 10; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(10)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("Should allow up to 5 requests per minute for rate-limited endpoints")
    void doFilterInternal_UnderLimit_AllowsRequests() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");

        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("Should block the 6th request with HTTP 429 and RFC 9457 JSON")
    void doFilterInternal_OverLimit_BlocksRequest() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");

        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(429);
        verify(response).setContentType("application/problem+json");
        verify(filterChain, times(5)).doFilter(request, response);
    }

    @Test
    @DisplayName("Should bypass rate limiting for non-sensitive endpoints")
    void doFilterInternal_NonSensitiveEndpoint_BypassesLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/users/me");

        for (int i = 0; i < 10; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(10)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("Should parse X-Forwarded-For header for client IP")
    void doFilterInternal_XForwardedForHeader_ParsesIP() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1, 192.168.1.1");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Should parse empty X-Forwarded-For header for client IP")
    void doFilterInternal_EmptyXForwardedForHeader_ParsesIP() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("");

        rateLimitFilter.doFilterInternal(request, response, filterChain);
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Should expire older timestamps")
    void doFilterInternal_OldTimestamps_ExpiresThem() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.101");

        Field field = RateLimitFilter.class.getDeclaredField("requestCounts");
        field.setAccessible(true);

        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Deque<Long>> requestCounts =
                (ConcurrentHashMap<String, Deque<Long>>) field.get(rateLimitFilter);

        Deque<Long> deque = new ArrayDeque<>();
        deque.add(System.currentTimeMillis() - 65_000L);
        requestCounts.put("192.168.1.101", deque);

        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }
}
