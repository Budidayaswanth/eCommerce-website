package com.leopaints.mapper;

import com.leopaints.dto.request.BannerRequest;
import com.leopaints.dto.response.BannerResponse;
import com.leopaints.entity.Banner;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    BannerResponse toResponse(Banner banner);

    @Mapping(target = "id", ignore = true)
    Banner toEntity(BannerRequest request);

    @Mapping(target = "id", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(BannerRequest request, @MappingTarget Banner banner);
}
