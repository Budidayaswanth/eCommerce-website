package com.leopaints.controller;

import com.leopaints.dto.request.CouponRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.CouponResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@Tag(name = "Admin Coupons", description = "Coupon creation and discount management")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> response = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get coupon by ID")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
        CouponResponse response = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create a new coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        CouponResponse response = couponService.createCoupon(request, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Coupon created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        CouponResponse response = couponService.updateCoupon(id, request, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Coupon updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        couponService.deleteCoupon(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Coupon deleted successfully"));
    }
}
