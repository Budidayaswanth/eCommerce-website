package com.leopaints.mapper;

import com.leopaints.dto.response.ChatMessageResponse;
import com.leopaints.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    ChatMessageResponse toResponse(ChatMessage chatMessage);
}
