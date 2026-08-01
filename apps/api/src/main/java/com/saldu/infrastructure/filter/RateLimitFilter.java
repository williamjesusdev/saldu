package com.saldu.infrastructure.filter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long ONE_MINUTE_MS = 60_000L;

    private static final Set<String> RATE_LIMITED_ENDPOINTS =
            Set.of("/api/v1/auth/login", "/api/v1/auth/password/reset", "/api/v1/auth/password/reset/verify");

    private final ConcurrentHashMap<String, Deque<Long>> requestCounts = new ConcurrentHashMap<>();

    @Value("${spring.profiles.active:empty}")
    private String activeProfiles;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        boolean isE2ERunner = activeProfiles != null && activeProfiles.contains("e2e");
        String uri = req.getRequestURI();

        if (!isE2ERunner && RATE_LIMITED_ENDPOINTS.contains(uri)) {
            String clientIp = getClientIP(req);
            long now = System.currentTimeMillis();

            Deque<Long> timestamps = requestCounts.computeIfAbsent(clientIp, k -> new ArrayDeque<>());

            synchronized (timestamps) {
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > ONE_MINUTE_MS) {
                    timestamps.pollFirst();
                }

                if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                    res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    res.setContentType("application/problem+json");
                    res.getWriter().write("""
                            {
                                "type": "about:blank",
                                "title": "Too Many Requests",
                                "status": 429,
                                "detail": "Rate limit exceeded. Maximum 5 requests per minute allowed.",
                                "instance": "%s"
                            }
                            """.formatted(uri));
                    return;
                }

                timestamps.addLast(now);
            }
        }

        chain.doFilter(req, res);
    }

    private String getClientIP(HttpServletRequest req) {
        String xfHeader = req.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return req.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
