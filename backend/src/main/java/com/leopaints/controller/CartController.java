package com.leopaints.controller;

import com.leopaints.dto.request.CartItemRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.CartResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart operations")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's shopping cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartResponse response = cartService.getCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CartResponse response = cartService.addItem(principal.getId(), request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(response, "Item added to cart"));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @PathVariable Long id,
            @RequestParam int quantity,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CartResponse response = cartService.updateItemQuantity(principal.getId(), id, quantity);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart updated"));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CartResponse response = cartService.removeItem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from cart"));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }
}
