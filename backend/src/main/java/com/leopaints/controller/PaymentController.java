package com.leopaints.controller;

import com.leopaints.dto.request.PaymentVerifyRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.PaymentResponse;
import com.leopaints.dto.response.PaymentSessionResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Cashfree payments integration and verification")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-session")
    @Operation(summary = "Create Cashfree payment session for an order")
    public ResponseEntity<ApiResponse<PaymentSessionResponse>> createPaymentSession(
            @RequestBody Map<String, Long> request
    ) {
        Long orderId = request.get("orderId");
        PaymentSessionResponse response = paymentService.createPaymentSession(orderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment session created"));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify payment status with Cashfree")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request
    ) {
        PaymentResponse response = paymentService.verifyPayment(request.getOrderId(), request.getCfOrderId());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment verified"));
    }

    @PostMapping("/admin/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Initiate refund for a payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiateRefund(
            @PathVariable Long paymentId,
            @RequestBody Map<String, BigDecimal> request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        BigDecimal amount = request.get("amount");
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        PaymentResponse response = paymentService.initiateRefund(paymentId, amount, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Refund initiated successfully"));
    }
}
