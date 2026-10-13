package com.leopaints.controller;

import com.leopaints.dto.request.ChatMessageRequest;
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
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Live customer chat and bot assistance")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    @Operation(summary = "Send a chat message")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        ChatMessageResponse response = chatService.sendMessage(userId, request.getMessage(), request.getSessionId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/messages/{sessionId}")
    @Operation(summary = "Get conversation history for a chat session")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getSessionMessages(
            @PathVariable String sessionId
    ) {
        List<ChatMessageResponse> response = chatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
