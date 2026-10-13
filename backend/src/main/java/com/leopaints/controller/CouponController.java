package com.leopaints.controller;

import com.leopaints.dto.request.ValidateCouponRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.CouponValidationResponse;
import com.leopaints.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation for customers")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Validate a coupon code against order amount")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request
    ) {
        CouponValidationResponse response = couponService.validateCoupon(request.getCode(), request.getOrderAmount());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
