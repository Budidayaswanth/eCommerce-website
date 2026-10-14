package com.leopaints.controller;

import com.leopaints.dto.request.CreateOrderRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.OrderResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Customer order placement and tracking")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create an order from cart")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse response = orderService.createOrder(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Order placed successfully"));
    }

    @GetMapping
    @Operation(summary = "Get current user's orders (active or archived)")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "false") Boolean isArchived,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PagedResponse<OrderResponse> response = orderService.getUserOrders(principal.getId(), isArchived, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse response = orderService.getOrderByIdAndUserId(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Cancelled by user";
        OrderResponse response = orderService.cancelOrder(id, principal.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Order cancelled successfully"));
    }

    @PutMapping("/{id}/archive")
    @Operation(summary = "Archive an order from active history")
    public ResponseEntity<ApiResponse<OrderResponse>> archiveOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse response = orderService.archiveOrder(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Order archived successfully"));
    }

    @PutMapping("/{id}/unarchive")
    @Operation(summary = "Restore an archived order back to active history")
    public ResponseEntity<ApiResponse<OrderResponse>> unarchiveOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse response = orderService.unarchiveOrder(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Order restored to active history"));
    }
}
