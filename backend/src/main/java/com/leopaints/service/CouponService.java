package com.leopaints.service;

import com.leopaints.dto.request.CouponRequest;
import com.leopaints.dto.response.CouponResponse;
import com.leopaints.dto.response.CouponValidationResponse;
import com.leopaints.entity.Coupon;
import com.leopaints.enums.CouponType;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.CouponMapper;
import com.leopaints.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Coupon code cannot be empty")
                    .build();
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (coupon == null || !Boolean.TRUE.equals(coupon.getIsActive())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Invalid or inactive coupon code")
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Coupon is not active yet")
                    .build();
        }

        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Coupon has expired")
                    .build();
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Coupon usage limit has been reached")
                    .build();
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .discount(BigDecimal.ZERO)
                    .message("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required to use this coupon")
                    .build();
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);

        return CouponValidationResponse.builder()
                .valid(true)
                .discount(discount)
                .message("Coupon applied successfully! You save ₹" + discount)
                .build();
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        if (coupon.getType() == CouponType.PERCENT) {
            discount = orderAmount.multiply(coupon.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            discount = coupon.getValue();
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        }
        return discount;
    }

    @Transactional
    public void applyCoupon(String code) {
        if (code == null || code.trim().isEmpty()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    @Transactional
    public void rollbackCoupon(String code) {
        if (code == null || code.trim().isEmpty()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
            if (coupon.getUsedCount() > 0) {
                coupon.setUsedCount(coupon.getUsedCount() - 1);
                couponRepository.save(coupon);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        return couponMapper.toResponse(coupon);
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request, String performedBy) {
        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = couponMapper.toEntity(request);
        coupon.setCode(request.getCode().toUpperCase().trim());
        Coupon saved = couponRepository.save(coupon);

        auditService.log("COUPON", saved.getId(), "CREATE", performedBy, null, saved.getCode(), null);
        return couponMapper.toResponse(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request, String performedBy) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        couponMapper.updateEntityFromRequest(request, coupon);
        coupon.setCode(request.getCode().toUpperCase().trim());
        Coupon updated = couponRepository.save(coupon);

        auditService.log("COUPON", updated.getId(), "UPDATE", performedBy, null, updated.getCode(), null);
        return couponMapper.toResponse(updated);
    }

    @Transactional
    public void deleteCoupon(Long id, String performedBy) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        couponRepository.delete(coupon);
        auditService.log("COUPON", id, "DELETE", performedBy, coupon.getCode(), null, null);
    }
}
