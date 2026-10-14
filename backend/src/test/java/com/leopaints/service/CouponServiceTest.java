package com.leopaints.service;

import com.leopaints.dto.response.CouponValidationResponse;
import com.leopaints.entity.Coupon;
import com.leopaints.enums.CouponType;
import com.leopaints.mapper.CouponMapper;
import com.leopaints.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponMapper couponMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        percentCoupon = Coupon.builder()
                .id(1L)
                .code("FESTIVE25")
                .type(CouponType.PERCENT)
                .value(BigDecimal.valueOf(25))
                .minOrderAmount(BigDecimal.valueOf(1000))
                .maxDiscount(BigDecimal.valueOf(500))
                .isActive(true)
                .usedCount(5)
                .usageLimit(100)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .build();

        fixedCoupon = Coupon.builder()
                .id(2L)
                .code("FLAT200")
                .type(CouponType.FLAT)
                .value(BigDecimal.valueOf(200))
                .minOrderAmount(BigDecimal.valueOf(500))
                .isActive(true)
                .usedCount(0)
                .usageLimit(50)
                .build();
    }

    @Test
    @DisplayName("validateCoupon: returns valid percentage discount capped at maxDiscount")
    void testValidateCouponPercentageCapped() {
        when(couponRepository.findByCodeIgnoreCase("FESTIVE25")).thenReturn(Optional.of(percentCoupon));

        // Order amount: ₹3000 -> 25% of 3000 is 750, capped at maxDiscount ₹500
        CouponValidationResponse response = couponService.validateCoupon("FESTIVE25", BigDecimal.valueOf(3000));

        assertTrue(response.isValid());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(response.getDiscount()));
    }

    @Test
    @DisplayName("validateCoupon: returns valid percentage discount when below maxDiscount")
    void testValidateCouponPercentageUncapped() {
        when(couponRepository.findByCodeIgnoreCase("FESTIVE25")).thenReturn(Optional.of(percentCoupon));

        // Order amount: ₹1200 -> 25% of 1200 is 300 (< maxDiscount 500)
        CouponValidationResponse response = couponService.validateCoupon("FESTIVE25", BigDecimal.valueOf(1200));

        assertTrue(response.isValid());
        assertEquals(0, BigDecimal.valueOf(300.00).compareTo(response.getDiscount()));
    }

    @Test
    @DisplayName("validateCoupon: fails when order amount is less than minOrderAmount")
    void testValidateCouponBelowMinimumOrder() {
        when(couponRepository.findByCodeIgnoreCase("FESTIVE25")).thenReturn(Optional.of(percentCoupon));

        CouponValidationResponse response = couponService.validateCoupon("FESTIVE25", BigDecimal.valueOf(800));

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("Minimum order amount of ₹1000 required"));
    }

    @Test
    @DisplayName("validateCoupon: fails when coupon is expired")
    void testValidateCouponExpired() {
        percentCoupon.setValidUntil(LocalDateTime.now().minusDays(2));
        when(couponRepository.findByCodeIgnoreCase("FESTIVE25")).thenReturn(Optional.of(percentCoupon));

        CouponValidationResponse response = couponService.validateCoupon("FESTIVE25", BigDecimal.valueOf(2000));

        assertFalse(response.isValid());
        assertEquals("Coupon has expired", response.getMessage());
    }

    @Test
    @DisplayName("validateCoupon: fails when usage limit has been reached")
    void testValidateCouponUsageLimitReached() {
        percentCoupon.setUsedCount(100);
        when(couponRepository.findByCodeIgnoreCase("FESTIVE25")).thenReturn(Optional.of(percentCoupon));

        CouponValidationResponse response = couponService.validateCoupon("FESTIVE25", BigDecimal.valueOf(2000));

        assertFalse(response.isValid());
        assertEquals("Coupon usage limit has been reached", response.getMessage());
    }

    @Test
    @DisplayName("calculateDiscount: fixed coupon discounts value but does not exceed order total")
    void testFixedCouponDiscountCapping() {
        BigDecimal discountSmallOrder = couponService.calculateDiscount(fixedCoupon, BigDecimal.valueOf(150));
        assertEquals(BigDecimal.valueOf(150), discountSmallOrder); // Capped at total order amount

        BigDecimal discountNormalOrder = couponService.calculateDiscount(fixedCoupon, BigDecimal.valueOf(1000));
        assertEquals(BigDecimal.valueOf(200), discountNormalOrder);
    }
}
