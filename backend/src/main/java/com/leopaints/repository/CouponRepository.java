package com.leopaints.repository;

import com.leopaints.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    List<Coupon> findByIsActiveTrue();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Coupon c SET c.usedCount = c.usedCount + 1 WHERE UPPER(c.code) = UPPER(:code) AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    int incrementUsageIfUnderLimit(@org.springframework.data.repository.query.Param("code") String code);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Coupon c SET c.usedCount = c.usedCount - 1 WHERE UPPER(c.code) = UPPER(:code) AND c.usedCount > 0")
    int decrementUsage(@org.springframework.data.repository.query.Param("code") String code);
}
