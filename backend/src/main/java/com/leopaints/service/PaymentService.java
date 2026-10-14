package com.leopaints.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leopaints.dto.response.PaymentResponse;
import com.leopaints.dto.response.PaymentSessionResponse;
import com.leopaints.entity.Order;
import com.leopaints.entity.OrderItem;
import com.leopaints.entity.Payment;
import com.leopaints.entity.Product;
import com.leopaints.enums.OrderStatus;
import com.leopaints.enums.PaymentStatus;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.PaymentException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.exception.UnauthorizedException;
import com.leopaints.repository.OrderRepository;
import com.leopaints.repository.PaymentRepository;
import com.leopaints.repository.ProductRepository;
import com.leopaints.util.CashfreeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponService couponService;
    private final AuditService auditService;
    private final CashfreeUtil cashfreeUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.cashfree.app-id:}")
    private String cashfreeAppId;

    @Value("${app.cashfree.secret-key:}")
    private String cashfreeSecretKey;

    @Value("${app.cashfree.api-version:2023-08-01}")
    private String cashfreeApiVersion;

    @Value("${app.cashfree.base-url:https://sandbox.cashfree.com/pg}")
    private String cashfreeBaseUrl;

    @Value("${app.cashfree.mock-enabled:false}")
    private boolean mockCashfreeEnabled;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public PaymentSessionResponse createPaymentSession(Long orderId) {
        return createPaymentSession(orderId, null, true);
    }

    @Transactional
    public PaymentSessionResponse createPaymentSession(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to create payment session for this order");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot create payment session for order in status: " + order.getStatus());
        }

        String cfOrderId = "CF_" + order.getOrderNumber() + "_" + System.currentTimeMillis();

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .order(order)
                    .cfOrderId(cfOrderId)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .status(PaymentStatus.PENDING)
                    .build();
        } else {
            payment.setCfOrderId(cfOrderId);
            payment.setAmount(order.getTotalAmount());
            payment.setStatus(PaymentStatus.PENDING);
        }

        String paymentSessionId;

        // Try live Cashfree API if app-id and secret-key are provided
        if (cashfreeAppId != null && !cashfreeAppId.trim().isEmpty() &&
            cashfreeSecretKey != null && !cashfreeSecretKey.trim().isEmpty()) {
            try {
                paymentSessionId = callCashfreeCreateOrder(order, cfOrderId);
            } catch (Exception e) {
                log.warn("Failed to call Cashfree API, generating sandbox mock session: {}", e.getMessage());
                paymentSessionId = "session_mock_" + UUID.randomUUID().toString().replace("-", "");
            }
        } else {
            // Mock sandbox session for local development
            log.info("Cashfree credentials not configured. Using mock payment session for dev/test.");
            paymentSessionId = "session_mock_" + UUID.randomUUID().toString().replace("-", "");
        }

        payment = paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        return PaymentSessionResponse.builder()
                .orderId(order.getId())
                .cfOrderId(cfOrderId)
                .paymentSessionId(paymentSessionId)
                .build();
    }

    private String callCashfreeCreateOrder(Order order, String cfOrderId) throws Exception {
        RestClient restClient = RestClient.builder()
                .baseUrl(cashfreeBaseUrl)
                .defaultHeader("x-client-id", cashfreeAppId)
                .defaultHeader("x-client-secret", cashfreeSecretKey)
                .defaultHeader("x-api-version", cashfreeApiVersion)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> customerDetails = new HashMap<>();
        String customerId = order.getUser() != null ? "cust_" + order.getUser().getId() : "cust_" + order.getId();
        String customerName = order.getUser() != null && order.getUser().getName() != null ? order.getUser().getName() : "Valued Customer";
        String customerEmail = order.getUser() != null && order.getUser().getEmail() != null ? order.getUser().getEmail() : "customer@leopaints.com";
        String customerPhone = order.getUser() != null && order.getUser().getPhone() != null ? order.getUser().getPhone() : "9999999999";

        customerDetails.put("customer_id", customerId);
        customerDetails.put("customer_name", customerName);
        customerDetails.put("customer_email", customerEmail);
        customerDetails.put("customer_phone", customerPhone);

        Map<String, Object> orderMeta = new HashMap<>();
        orderMeta.put("return_url", frontendUrl + "/payment/status?orderId=" + order.getId() + "&cf_order_id={order_id}");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("order_id", cfOrderId);
        requestBody.put("order_amount", order.getTotalAmount().doubleValue());
        requestBody.put("order_currency", "INR");
        requestBody.put("customer_details", customerDetails);
        requestBody.put("order_meta", orderMeta);

        String response = restClient.post()
                .uri("/orders")
                .body(requestBody)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(response);
        return root.path("payment_session_id").asText();
    }

    @Transactional
    public PaymentResponse verifyPayment(Long orderId, String cfOrderId) {
        return verifyPayment(orderId, cfOrderId, null, true);
    }

    @Transactional
    public PaymentResponse verifyPayment(Long orderId, String cfOrderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to verify payment for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order id: " + orderId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toPaymentResponse(payment);
        }

        boolean verifiedSuccess = false;
        String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 8);
        String paymentMethod = "UPI";

        if (cashfreeAppId != null && !cashfreeAppId.trim().isEmpty() &&
            cashfreeSecretKey != null && !cashfreeSecretKey.trim().isEmpty()) {
            try {
                RestClient restClient = RestClient.builder()
                        .baseUrl(cashfreeBaseUrl)
                        .defaultHeader("x-client-id", cashfreeAppId)
                        .defaultHeader("x-client-secret", cashfreeSecretKey)
                        .defaultHeader("x-api-version", cashfreeApiVersion)
                        .build();

                String checkOrderId = cfOrderId != null ? cfOrderId : payment.getCfOrderId();
                String response = restClient.get()
                        .uri("/orders/{order_id}/payments", checkOrderId)
                        .retrieve()
                        .body(String.class);

                JsonNode root = objectMapper.readTree(response);
                if (root.isArray() && !root.isEmpty()) {
                    JsonNode firstPayment = root.get(0);
                    String status = firstPayment.path("payment_status").asText();
                    paymentId = firstPayment.path("cf_payment_id").asText(paymentId);
                    paymentMethod = firstPayment.path("payment_group").asText("UPI");
                    verifiedSuccess = "SUCCESS".equalsIgnoreCase(status);
                }
            } catch (Exception e) {
                log.error("Cashfree status verification error: {}", e.getMessage());
                verifiedSuccess = false;
            }
        } else if (mockCashfreeEnabled) {
            log.info("Mock Cashfree verification enabled for dev environment");
            verifiedSuccess = true;
        } else {
            log.warn("Cashfree gateway credentials not configured. Verification rejected in production mode.");
            verifiedSuccess = false;
        }

        if (verifiedSuccess) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setCfPaymentId(paymentId);
            payment.setPaymentMethod(paymentMethod);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.CONFIRMED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            auditService.log("PAYMENT", payment.getId(), "VERIFIED_SUCCESS", "SYSTEM", "PENDING", "SUCCESS", null);
            log.info("Payment SUCCESS for order: {}", order.getOrderNumber());
        } else {
            handlePaymentFailure(order, payment, "Payment failed during verification");
        }

        return toPaymentResponse(payment);
    }

    @Transactional
    public void handleWebhook(String payload, String signature, String timestamp) {
        log.info("Received Cashfree webhook: timestamp={}", timestamp);

        if (cashfreeSecretKey == null || cashfreeSecretKey.trim().isEmpty()) {
            log.error("Rejecting Cashfree webhook: secret key is not configured");
            throw new PaymentException("Cashfree payment gateway webhook is unconfigured");
        }

        boolean valid = cashfreeUtil.verifyWebhookSignature(payload, signature, timestamp, cashfreeSecretKey);
        if (!valid) {
            log.warn("Invalid Cashfree webhook signature!");
            throw new PaymentException("Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String type = root.path("type").asText();
            JsonNode data = root.path("data");

            String cfOrderId = data.path("order").path("order_id").asText();
            String paymentStatus = data.path("payment").path("payment_status").asText();
            String cfPaymentId = data.path("payment").path("cf_payment_id").asText();
            String paymentMethod = data.path("payment").path("payment_group").asText();

            Payment payment = paymentRepository.findByCfOrderId(cfOrderId).orElse(null);
            if (payment == null) {
                log.warn("No payment found for cfOrderId: {}", cfOrderId);
                return;
            }

            // Idempotent: don't re-process if already in terminal status
            if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.REFUNDED) {
                log.info("Payment {} already in state: {}", payment.getId(), payment.getStatus());
                return;
            }

            Order order = payment.getOrder();
            payment.setCfResponseJson(payload);
            payment.setCfPaymentId(cfPaymentId);
            payment.setPaymentMethod(paymentMethod);

            if ("SUCCESS".equalsIgnoreCase(paymentStatus)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);

                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);

                auditService.log("PAYMENT", payment.getId(), "WEBHOOK_SUCCESS", "WEBHOOK", null, "SUCCESS", null);
            } else if ("FAILED".equalsIgnoreCase(paymentStatus) || "USER_DROPPED".equalsIgnoreCase(paymentStatus)) {
                handlePaymentFailure(order, payment, "Webhook event: " + type + ", status: " + paymentStatus);
            }
        } catch (Exception e) {
            log.error("Failed to process webhook payload", e);
            throw new PaymentException("Webhook processing error: " + e.getMessage());
        }
    }

    @Transactional
    public void handlePaymentFailure(Order order, Payment payment, String reason) {
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        orderRepository.save(order);

        // Rollback stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
            log.info("Rolled back stock for product id={}: +{}", product.getId(), item.getQuantity());
        }

        // Rollback coupon usage
        if (order.getCouponCode() != null) {
            couponService.rollbackCoupon(order.getCouponCode());
            log.info("Rolled back coupon: {}", order.getCouponCode());
        }

        auditService.log("PAYMENT", payment.getId(), "PAYMENT_FAILED", "SYSTEM", "PENDING", "FAILED: " + reason, null);
    }

    @Transactional
    public PaymentResponse initiateRefund(Long paymentId, BigDecimal amount, String performedBy) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Can only refund payments that were successful");
        }

        Order order = payment.getOrder();
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

        auditService.log("PAYMENT", paymentId, "REFUND", performedBy, "SUCCESS", "REFUNDED ₹" + amount, null);
        return toPaymentResponse(payment);
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .cfOrderId(payment.getCfOrderId())
                .cfPaymentId(payment.getCfPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
