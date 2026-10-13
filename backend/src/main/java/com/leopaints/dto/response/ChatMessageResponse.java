package com.leopaints.dto.response;

import com.leopaints.enums.MessageSender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long adminId;
    private String message;
    private MessageSender sender;
    private String sessionId;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
