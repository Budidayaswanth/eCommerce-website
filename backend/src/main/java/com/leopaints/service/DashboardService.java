package com.leopaints.service;

import com.leopaints.dto.response.DashboardStatsResponse;
import com.leopaints.repository.OrderRepository;
import com.leopaints.repository.ProductRepository;
import com.leopaints.repository.ReviewRepository;
import com.leopaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long ordersToday = orderRepository.countOrdersToday(startOfToday);
        long totalUsers = userRepository.count();
        long lowStockCount = productRepository.countByStockQuantityLessThan(10);
        long totalOrders = orderRepository.count();
        long pendingReviewsCount = reviewRepository.countByIsApprovedFalse();

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .ordersToday(ordersToday)
                .totalUsers(totalUsers)
                .lowStockCount(lowStockCount)
                .totalOrders(totalOrders)
                .pendingReviewsCount(pendingReviewsCount)
                .build();
    }
}
