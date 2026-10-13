package com.leopaints.controller;

import com.leopaints.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Asynchronous payment webhook callbacks")
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping("/cashfree")
    @Operation(summary = "Cashfree payment gateway webhook endpoint")
    public ResponseEntity<Map<String, String>> handleCashfreeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "x-webhook-signature", required = false) String signature,
            @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp
    ) {
        log.info("Received Cashfree webhook: timestamp={}", timestamp);
        paymentService.handleWebhook(payload, signature, timestamp);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook processed"));
    }
}
