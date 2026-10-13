package com.leopaints.mapper;

import com.leopaints.dto.response.AuditLogResponse;
import com.leopaints.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogResponse toResponse(AuditLog auditLog);
}
