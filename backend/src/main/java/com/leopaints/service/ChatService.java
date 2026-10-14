package com.leopaints.service;

import com.leopaints.dto.response.ChatMessageResponse;
import com.leopaints.entity.ChatMessage;
import com.leopaints.entity.Coupon;
import com.leopaints.entity.Order;
import com.leopaints.entity.User;
import com.leopaints.enums.MessageSender;
import com.leopaints.exception.UnauthorizedException;
import com.leopaints.mapper.ChatMessageMapper;
import com.leopaints.repository.ChatMessageRepository;
import com.leopaints.repository.CouponRepository;
import com.leopaints.repository.OrderRepository;
import com.leopaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final ChatMessageMapper chatMessageMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessageResponse sendMessage(Long userId, String message, String sessionId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        String actualSessionId = (sessionId != null && !sessionId.trim().isEmpty())
                ? sessionId.trim()
                : "chat_" + (userId != null ? userId + "_" : "") + UUID.randomUUID().toString().substring(0, 8);

        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .message(message)
                .sender(MessageSender.USER)
                .sessionId(actualSessionId)
                .isRead(false)
                .build();

        ChatMessage savedUserMessage = chatMessageRepository.save(userMessage);
        ChatMessageResponse userMsgResponse = chatMessageMapper.toResponse(savedUserMessage);

        // Notify subscribers over STOMP
        broadcastMessage(actualSessionId, userMsgResponse);

        // Intent matching for bot auto-reply
        String autoReplyText = matchBotIntent(userId, message);
        if (autoReplyText != null) {
            ChatMessage botMessage = ChatMessage.builder()
                    .user(user)
                    .message(autoReplyText)
                    .sender(MessageSender.BOT)
                    .sessionId(actualSessionId)
                    .isRead(true)
                    .build();

            ChatMessage savedBotMessage = chatMessageRepository.save(botMessage);
            ChatMessageResponse botMsgResponse = chatMessageMapper.toResponse(savedBotMessage);
            broadcastMessage(actualSessionId, botMsgResponse);
        }

        return userMsgResponse;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(String sessionId) {
        return getSessionMessages(sessionId, null, true);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(String sessionId, Long currentUserId, boolean isAdmin) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderBySentAtAsc(sessionId);
        if (!isAdmin && currentUserId != null) {
            boolean hasOtherUser = messages.stream()
                    .anyMatch(m -> m.getUser() != null && !m.getUser().getId().equals(currentUserId));
            if (hasOtherUser) {
                throw new UnauthorizedException("Not authorized to view this chat session");
            }
        }
        // Bound chat session context window to the latest 100 messages to prevent memory bloat
        int total = messages.size();
        List<ChatMessage> contextWindow = total > 100 ? messages.subList(total - 100, total) : messages;

        return contextWindow.stream()
                .map(chatMessageMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getUnreadChats() {
        return chatMessageRepository.findByIsReadFalse().stream()
                .map(chatMessageMapper::toResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse adminReply(String sessionId, String message, Long adminId) {
        ChatMessage adminMessage = ChatMessage.builder()
                .adminId(adminId)
                .message(message)
                .sender(MessageSender.ADMIN)
                .sessionId(sessionId)
                .isRead(true)
                .build();

        // Mark earlier user messages in session as read
        List<ChatMessage> unreadMessages = chatMessageRepository.findBySessionIdOrderBySentAtAsc(sessionId);
        for (ChatMessage m : unreadMessages) {
            if (!Boolean.TRUE.equals(m.getIsRead())) {
                m.setIsRead(true);
                chatMessageRepository.save(m);
            }
        }

        ChatMessage saved = chatMessageRepository.save(adminMessage);
        ChatMessageResponse response = chatMessageMapper.toResponse(saved);

        broadcastMessage(sessionId, response);
        return response;
    }

    private void broadcastMessage(String sessionId, ChatMessageResponse message) {
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, message);
        } catch (Exception e) {
            log.warn("Could not broadcast chat message over STOMP: {}", e.getMessage());
        }
    }

    private String matchBotIntent(Long userId, String text) {
        if (text == null) return null;
        String lower = text.toLowerCase();

        if (lower.contains("order status") || (lower.contains("order") && (lower.contains("track") || lower.contains("where")))) {
            if (userId != null) {
                var orders = orderRepository.findByUserIdOrderByPlacedAtDesc(userId, PageRequest.of(0, 1));
                if (orders.hasContent()) {
                    Order latest = orders.getContent().get(0);
                    return "Your latest order #" + latest.getOrderNumber() + " is currently in status: " + latest.getStatus() +
                            ". Placed on: " + latest.getPlacedAt().toLocalDate() + ". Total: ₹" + latest.getTotalAmount();
                } else {
                    return "You have not placed any orders yet. Explore our paints catalogue to get started!";
                }
            } else {
                return "Please log in to track your specific order status, or check the Orders section in your profile.";
            }
        }

        if (lower.contains("payment") || lower.contains("pay") || lower.contains("cashfree")) {
            return "We accept secure payments via Cashfree Payment Gateway including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets.";
        }

        if (lower.contains("refund") || lower.contains("return")) {
            return "LEO PAINTS offers a 7-day hassle-free return policy for unopened and undamaged paint containers. Once inspected, refunds are processed within 5-7 business days.";
        }

        if (lower.contains("cancel")) {
            return "You can cancel your order directly from 'My Orders' if it is in PLACED or CONFIRMED status before dispatch.";
        }

        if (lower.contains("coupon") || lower.contains("discount") || lower.contains("offer")) {
            List<Coupon> coupons = couponRepository.findByIsActiveTrue();
            if (!coupons.isEmpty()) {
                String codes = coupons.stream()
                        .map(c -> c.getCode() + " (" + c.getDescription() + ")")
                        .collect(Collectors.joining(", "));
                return "Available discount coupons right now: " + codes;
            }
            return "Use code WELCOME10 for 10% off on your first order!";
        }

        return "Thank you for reaching out to Leo Paints! A paint consultant has been notified and will assist you shortly. In the meantime, feel free to ask about our finishes, orders, or coupons.";
    }
}
