package com.leopaints.mapper;

import com.leopaints.dto.request.CouponRequest;
import com.leopaints.dto.response.CouponResponse;
import com.leopaints.entity.Coupon;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    CouponResponse toResponse(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    Coupon toEntity(CouponRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(CouponRequest request, @MappingTarget Coupon coupon);
}
