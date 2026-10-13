package com.leopaints.controller;

import com.leopaints.dto.request.UpdateOrderStatusRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.OrderResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.enums.OrderStatus;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders", description = "Admin order processing and status fulfillment")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders with optional status filter")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) OrderStatus status
    ) {
        PagedResponse<OrderResponse> response = orderService.getAllOrders(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID for admin")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus(), request.getCancelReason(), performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated to " + request.getStatus()));
    }
}
