package com.leopaints.dto.response;

import com.leopaints.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private AddressResponse address;
    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
    private PaymentResponse payment;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal totalAmount;
    private String couponCode;
    private OrderStatus status;
    private String cancelReason;
    private String notes;
    private LocalDateTime placedAt;
    private LocalDateTime deliveredAt;
    private Boolean isArchived;
    private LocalDateTime archivedAt;
    private LocalDateTime updatedAt;
}
