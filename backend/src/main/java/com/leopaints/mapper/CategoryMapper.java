package com.leopaints.mapper;

import com.leopaints.dto.response.CategoryResponse;
import com.leopaints.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    CategoryResponse toResponse(Category category);
}
