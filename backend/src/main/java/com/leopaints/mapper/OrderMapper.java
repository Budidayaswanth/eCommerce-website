package com.leopaints.mapper;

import com.leopaints.dto.response.OrderItemResponse;
import com.leopaints.dto.response.OrderResponse;
import com.leopaints.dto.response.PaymentResponse;
import com.leopaints.entity.Order;
import com.leopaints.entity.OrderItem;
import com.leopaints.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userPhone", source = "user.phone")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "payment", source = "payment")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSlug", source = "product.slug")
    @Mapping(target = "imageUrl", source = "product.imageUrl")
    OrderItemResponse toItemResponse(OrderItem orderItem);

    PaymentResponse toPaymentResponse(Payment payment);
}
