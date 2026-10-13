package com.leopaints.controller;

import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.AuditLogResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Admin Audit Logs", description = "System audit trail and historical logs")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get audit logs with pagination and optional entityType filter")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType
    ) {
        PagedResponse<AuditLogResponse> response = auditService.getAuditLogs(page, size, entityType);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
