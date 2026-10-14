package com.leopaints.controller;

import com.leopaints.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health & Status", description = "Server and Database connectivity health checks")
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    @Operation(summary = "Check server and database connectivity status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("serverStatus", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("application", "LEO PAINTS Backend");
        healthData.put("version", "1.0.0");

        boolean dbConnected = false;
        String dbMessage = "Database connected successfully";

        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("SELECT 1");
            dbConnected = true;
            healthData.put("dbStatus", "UP");
            healthData.put("databaseProduct", connection.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            log.error("Database health check failed: {}", e.getMessage());
            dbConnected = false;
            dbMessage = "Database service is temporarily unavailable";
            healthData.put("dbStatus", "DOWN");
        }

        healthData.put("isHealthy", dbConnected);

        if (dbConnected) {
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .status("DB_CONNECTED")
                    .message(dbMessage)
                    .data(healthData)
                    .timestamp(LocalDateTime.now())
                    .build());
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false)
                            .status("DB_CONNECTION_ERROR")
                            .message(dbMessage)
                            .data(healthData)
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
}
