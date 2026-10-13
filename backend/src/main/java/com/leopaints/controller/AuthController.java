package com.leopaints.controller;

import com.leopaints.dto.request.AdminLoginRequest;
import com.leopaints.dto.request.RefreshTokenRequest;
import com.leopaints.dto.request.RegisterRequest;
import com.leopaints.dto.request.SendOtpRequest;
import com.leopaints.dto.request.VerifyOtpRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.AuthResponse;
import com.leopaints.dto.response.UserResponse;
import com.leopaints.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for OTP login, admin authentication, and token refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to mobile number")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        LocalDateTime expiresAt = authService.sendOtp(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "phone", request.getPhone(),
                        "expiresAt", expiresAt,
                        "message", "OTP sent successfully"
                ),
                "OTP sent successfully"
        ));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and login/register")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/register")
    @Operation(summary = "Complete customer registration")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/admin/login")
    @Operation(summary = "Admin login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        AuthResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Admin login successful"));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }
}
