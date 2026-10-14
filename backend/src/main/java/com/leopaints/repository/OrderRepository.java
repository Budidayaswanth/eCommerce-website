package com.leopaints.repository;

import com.leopaints.entity.Order;
import com.leopaints.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByPlacedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndIsArchivedOrderByPlacedAtDesc(Long userId, Boolean isArchived, Pageable pageable);

    long countByUserIdAndIsArchived(Long userId, Boolean isArchived);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    long countByStatus(OrderStatus status);

    List<Order> findByStatusAndPlacedAtBefore(OrderStatus status, LocalDateTime dateTime);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.placedAt >= :startOfDay")
    long countOrdersToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status NOT IN (com.leopaints.enums.OrderStatus.CANCELLED, com.leopaints.enums.OrderStatus.RETURNED)")
    BigDecimal calculateTotalRevenue();
}
