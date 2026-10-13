package com.leopaints.repository;

import com.leopaints.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderBySentAtAsc(String sessionId);

    List<ChatMessage> findByIsReadFalse();

    @Query("SELECT DISTINCT m.sessionId FROM ChatMessage m WHERE m.isRead = false")
    List<String> findDistinctSessionIdsWithUnreadMessages();
}
