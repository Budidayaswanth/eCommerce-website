package com.leopaints.mapper;

import com.leopaints.dto.response.UserResponse;
import com.leopaints.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
