package com.leopaints.service;

import com.leopaints.dto.response.AuditLogResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.entity.AuditLog;
import com.leopaints.mapper.AuditLogMapper;
import com.leopaints.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityType, Long entityId, String action, String performedBy, String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .performedBy(performedBy)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Audit logged: [{}] {} on {} id={} by {}", action, entityType, entityType, entityId, performedBy);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(int page, int size, String entityType) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditPage;
        if (entityType != null && !entityType.trim().isEmpty()) {
            auditPage = auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType.trim(), pageable);
        } else {
            auditPage = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        }

        Page<AuditLogResponse> responsePage = auditPage.map(auditLogMapper::toResponse);
        return PagedResponse.from(responsePage);
    }
}
