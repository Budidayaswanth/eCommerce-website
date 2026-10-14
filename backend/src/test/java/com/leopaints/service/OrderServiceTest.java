package com.leopaints.service;

import com.leopaints.dto.response.OrderResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.entity.*;
import com.leopaints.enums.OrderStatus;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.OrderMapper;
import com.leopaints.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CouponService couponService;

    @Mock
    private CartService cartService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private AuditService auditService;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private Order sampleOrder;
    private OrderResponse sampleOrderResponse;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Yaswanth")
                .phone("9876543210")
                .build();

        sampleOrder = Order.builder()
                .id(100L)
                .orderNumber("LEO-20261014-999")
                .user(sampleUser)
                .status(OrderStatus.DELIVERED)
                .totalAmount(BigDecimal.valueOf(2500))
                .isArchived(false)
                .items(new ArrayList<>())
                .build();

        sampleOrderResponse = OrderResponse.builder()
                .id(100L)
                .orderNumber("LEO-20261014-999")
                .isArchived(false)
                .build();
    }

    @Test
    @DisplayName("archiveOrder: sets isArchived to true and records timestamp")
    void testArchiveOrderSuccess() {
        when(orderRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderMapper.toResponse(any(Order.class))).thenReturn(sampleOrderResponse);

        OrderResponse result = orderService.archiveOrder(100L, 1L);

        assertNotNull(result);
        assertTrue(sampleOrder.getIsArchived());
        assertNotNull(sampleOrder.getArchivedAt());
        verify(orderRepository).save(sampleOrder);
        verify(auditService).log(eq("ORDER"), eq(100L), eq("ARCHIVE"), eq("1"), any(), any(), any());
    }

    @Test
    @DisplayName("archiveOrder: throws ResourceNotFoundException if user does not own order")
    void testArchiveOrderUnauthorized() {
        when(orderRepository.findByIdAndUserId(100L, 999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.archiveOrder(100L, 999L));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("unarchiveOrder: sets isArchived to false and clears timestamp")
    void testUnarchiveOrderSuccess() {
        sampleOrder.setIsArchived(true);
        sampleOrder.setArchivedAt(LocalDateTime.now());

        when(orderRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderMapper.toResponse(any(Order.class))).thenReturn(sampleOrderResponse);

        OrderResponse result = orderService.unarchiveOrder(100L, 1L);

        assertNotNull(result);
        assertFalse(sampleOrder.getIsArchived());
        assertNull(sampleOrder.getArchivedAt());
        verify(orderRepository).save(sampleOrder);
        verify(auditService).log(eq("ORDER"), eq(100L), eq("UNARCHIVE"), eq("1"), any(), any(), any());
    }

    @Test
    @DisplayName("getUserOrders: returns active vs archived orders based on parameter")
    void testGetUserOrdersArchivedFiltering() {
        Page<Order> page = new PageImpl<>(List.of(sampleOrder));
        when(orderRepository.findByUserIdAndIsArchivedOrderByPlacedAtDesc(eq(1L), eq(true), any(Pageable.class)))
                .thenReturn(page);
        when(orderMapper.toResponse(sampleOrder)).thenReturn(sampleOrderResponse);

        PagedResponse<OrderResponse> response = orderService.getUserOrders(1L, true, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(orderRepository).findByUserIdAndIsArchivedOrderByPlacedAtDesc(eq(1L), eq(true), any(Pageable.class));
    }

    @Test
    @DisplayName("cancelOrder: cancels placed order, rolls back product stock and coupon")
    void testCancelOrderSuccess() {
        Product paint = Product.builder().id(50L).stockQuantity(10).build();
        OrderItem item = OrderItem.builder().id(1L).product(paint).quantity(2).build();
        sampleOrder.setStatus(OrderStatus.PLACED);
        sampleOrder.getItems().add(item);
        sampleOrder.setCouponCode("FESTIVE25");

        when(orderRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderMapper.toResponse(any(Order.class))).thenReturn(sampleOrderResponse);

        OrderResponse response = orderService.cancelOrder(100L, 1L, "Changed my mind");

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, sampleOrder.getStatus());
        assertEquals("Changed my mind", sampleOrder.getCancelReason());
        assertEquals(12, paint.getStockQuantity()); // Stock rolled back by +2
        verify(productRepository).save(paint);
        verify(couponService).rollbackCoupon("FESTIVE25");
    }

    @Test
    @DisplayName("cancelOrder: throws BadRequestException if order is already DELIVERED")
    void testCancelOrderDeliveredThrowsException() {
        sampleOrder.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleOrder));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(100L, 1L, "Too late"));
        assertTrue(ex.getMessage().contains("Order cannot be cancelled in status: DELIVERED"));
    }
}
