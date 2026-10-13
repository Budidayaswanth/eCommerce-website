package com.leopaints.controller;

import com.leopaints.dto.request.AdminReplyRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.ChatMessageResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@Tag(name = "Admin Chat", description = "Admin agent chat reply and monitoring")
public class AdminChatController {

    private final ChatService chatService;

    @GetMapping("/unread")
    @Operation(summary = "Get unread chat messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getUnreadChats() {
        List<ChatMessageResponse> response = chatService.getUnreadChats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/reply")
    @Operation(summary = "Send an admin reply to a customer chat session")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> reply(
            @Valid @RequestBody AdminReplyRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : null;
        ChatMessageResponse response = chatService.adminReply(request.getSessionId(), request.getMessage(), adminId);
        return ResponseEntity.ok(ApiResponse.success(response, "Reply sent"));
    }
}
