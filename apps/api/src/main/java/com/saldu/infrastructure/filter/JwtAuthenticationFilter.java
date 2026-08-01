package com.saldu.infrastructure.filter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.saldu.domain.user.model.UserRole;
import com.saldu.domain.user.repository.RevokedTokenRepository;
import com.saldu.domain.user.repository.UserRepository;
import com.saldu.infrastructure.security.JwtService;
import com.saldu.infrastructure.security.SubscriptionContextHolder;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest req, @NonNull HttpServletResponse res, @NonNull FilterChain chain)
            throws ServletException, IOException {

        try {
            String token = jwtService.extractTokenFromRequest(req);

            if (token != null && !revokedTokenRepository.existsByToken(token) && jwtService.validateToken(token)) {
                UUID userId = jwtService.extractUserId(token);

                if (userRepository.existsByIdAndDeletedAtIsNull(userId)) {
                    UUID subscriptionId = jwtService.extractSubscriptionId(token);
                    if (subscriptionId != null) {
                        SubscriptionContextHolder.setSubscriptionId(subscriptionId);
                    }

                    UserRole role = jwtService.extractRole(token);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(new SimpleGrantedAuthority(role.toAuthority())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            chain.doFilter(req, res);
        } finally {
            SubscriptionContextHolder.clear();
            SecurityContextHolder.clearContext();
        }
    }
}
