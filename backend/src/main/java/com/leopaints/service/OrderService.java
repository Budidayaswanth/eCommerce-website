package com.leopaints.service;

import com.leopaints.dto.request.CreateOrderRequest;
import com.leopaints.dto.response.CouponValidationResponse;
import com.leopaints.dto.response.OrderResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.dto.response.PaymentSessionResponse;
import com.leopaints.entity.*;
import com.leopaints.enums.OrderStatus;
import com.leopaints.enums.PaymentStatus;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.OrderMapper;
import com.leopaints.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final CartService cartService;
    private final PaymentService paymentService;
    private final AuditService auditService;
    private final OrderMapper orderMapper;

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal STANDARD_DELIVERY_CHARGE = new BigDecimal("99.00");

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 1. Validate cart not empty
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your cart is empty. Please add items before checking out."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        // 2. Validate address belongs to user
        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new BadRequestException("Address not found or does not belong to you"));

        // 3. Validate stock for all items
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() +
                        "'. Only " + product.getStockQuantity() + " remaining.");
            }

            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Deduct stock (optimistic locking handled by @Version on Product)
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // 4. Apply coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponCode = request.getCouponCode().trim().toUpperCase();
            CouponValidationResponse couponValidation = couponService.validateCoupon(couponCode, subtotal);
            if (!couponValidation.isValid()) {
                throw new BadRequestException("Coupon error: " + couponValidation.getMessage());
            }
            discountAmount = couponValidation.getDiscount();
            couponService.applyCoupon(couponCode);
        }

        // 5. Calculate totals (delivery charge: free above ₹999)
        BigDecimal deliveryCharge = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_DELIVERY_CHARGE;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(deliveryCharge);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        // 6. Generate unique order number: LEO-YYYYMMDD-XXXX
        String orderNumber = generateOrderNumber();

        // 7. Create order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .address(address)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .deliveryCharge(deliveryCharge)
                .totalAmount(totalAmount)
                .couponCode(couponCode)
                .status(OrderStatus.PLACED)
                .notes(request.getNotes())
                .build();

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // 8. Create PENDING payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .amount(totalAmount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // 9. Clear cart
        cartService.clearCart(userId);

        auditService.log("ORDER", savedOrder.getId(), "CREATE", user.getPhone(), null, orderNumber, null);
        log.info("Order created successfully: {} for user id: {}", orderNumber, userId);

        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        return getUserOrders(userId, false, page, size);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(Long userId, Boolean isArchived, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean archived = Boolean.TRUE.equals(isArchived);
        Page<Order> orderPage = orderRepository.findByUserIdAndIsArchivedOrderByPlacedAtDesc(userId, archived, pageable);
        return PagedResponse.from(orderPage.map(orderMapper::toResponse));
    }

    @Transactional
    public OrderResponse archiveOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setIsArchived(true);
        order.setArchivedAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);
        auditService.log("ORDER", saved.getId(), "ARCHIVE", String.valueOf(userId), "isArchived: false", "isArchived: true", null);
        log.info("Order id={} archived by user={}", orderId, userId);
        return orderMapper.toResponse(saved);
    }

    @Transactional
    public OrderResponse unarchiveOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setIsArchived(false);
        order.setArchivedAt(null);
        Order saved = orderRepository.save(order);
        auditService.log("ORDER", saved.getId(), "UNARCHIVE", String.valueOf(userId), "isArchived: true", "isArchived: false", null);
        log.info("Order id={} unarchived by user={}", orderId, userId);
        return orderMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAndUserId(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus() +
                    ". Only PLACED or CONFIRMED orders can be cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason != null ? reason : "Cancelled by user");
        order.setUpdatedAt(LocalDateTime.now());

        // Rollback stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        // Rollback coupon
        if (order.getCouponCode() != null) {
            couponService.rollbackCoupon(order.getCouponCode());
        }

        Order saved = orderRepository.save(order);
        auditService.log("ORDER", saved.getId(), "CANCEL_BY_USER", String.valueOf(userId), null, reason, null);

        return orderMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("placedAt").descending());
        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByStatus(status, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }
        return PagedResponse.from(orderPage.map(orderMapper::toResponse));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status, String cancelReason, String performedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (status == OrderStatus.CANCELLED) {
            order.setCancelReason(cancelReason);
            // Rollback stock if cancelled by admin
            if (oldStatus != OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
                if (order.getCouponCode() != null) {
                    couponService.rollbackCoupon(order.getCouponCode());
                }
            }
        }

        Order saved = orderRepository.save(order);
        auditService.log("ORDER", orderId, "STATUS_CHANGE", performedBy, oldStatus.name(), status.name(), null);

        return orderMapper.toResponse(saved);
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "LEO-" + dateStr + "-" + suffix;
    }
}
