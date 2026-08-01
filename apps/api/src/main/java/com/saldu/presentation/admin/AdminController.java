package com.saldu.presentation.admin;

import java.util.Objects;
import java.util.UUID;
import jakarta.validation.Valid;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saldu.application.admin.AdminInviteService;
import com.saldu.application.admin.dto.InviteResponse;
import com.saldu.application.common.dto.MessageResponse;
import com.saldu.application.user.dto.UserResponse;
import com.saldu.presentation.admin.dto.CreateInviteRequest;
import com.saldu.presentation.admin.dto.InviteStatusFilter;
import com.saldu.presentation.admin.dto.RejectRequest;
import com.saldu.presentation.common.dto.PageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminInviteService adminInviteService;
    private final MessageSource messageSource;

    @GetMapping("/invites")
    public ResponseEntity<PageResponse<InviteResponse>> listInvites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) InviteStatusFilter status) {
        Page<InviteResponse> response = adminInviteService.listInvites(page, size, status);
        return ResponseEntity.ok(PageResponse.of(response));
    }

    @PostMapping("/invites")
    public ResponseEntity<InviteResponse> createInvite(
            @AuthenticationPrincipal UUID adminId, @Valid @RequestBody CreateInviteRequest request) {
        InviteResponse response = adminInviteService.createInvite(adminId, request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/{requestId}/approval")
    public ResponseEntity<UserResponse> approveRegistration(
            @AuthenticationPrincipal UUID adminId, @PathVariable UUID requestId) {
        UserResponse response = adminInviteService.approveAccessRequest(adminId, requestId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/{requestId}/rejection")
    public ResponseEntity<MessageResponse> rejectRegistration(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable UUID requestId,
            @RequestBody(required = false) RejectRequest request) {
        RejectRequest finalRequest = Objects.requireNonNullElse(request, new RejectRequest(""));
        adminInviteService.rejectAccessRequest(adminId, requestId, finalRequest.reason());
        String message = messageSource.getMessage(
                "admin.rejection_success", null, "Registration rejected successfully", LocaleContextHolder.getLocale());
        return ResponseEntity.ok(new MessageResponse(message));
    }
}
