package com.leopaints.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private Long ordersToday;
    private Long totalUsers;
    private Long lowStockCount;
    private Long totalOrders;
    private Long pendingReviewsCount;
}
