import React from 'react';
import { formatDate } from '../../utils/formatters';

const ChatBubble = ({ message, isTyping = false }) => {
  if (isTyping) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
        <div
          style={{
            backgroundColor: '#EEEEEE',
            padding: '10px 14px',
            borderRadius: '16px 16px 16px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="typing-dot" />
          <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
          <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
        </div>
        <style>{`
          .typing-dot {
            width: 6px;
            height: 6px;
            background-color: var(--color-primary);
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.2s infinite ease-in-out;
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  const isUser = message.sender === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '82%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isUser ? 'var(--color-primary)' : '#EEEEEE',
          color: isUser ? '#FFFFFF' : 'var(--color-text-primary)',
          fontSize: '0.875rem',
          lineHeight: 1.45,
          wordBreak: 'break-word',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {message.text}
      </div>
      <span
        style={{
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
          marginTop: '3px',
          padding: '0 4px',
        }}
      >
        {formatDate(message.timestamp, true)}
      </span>
    </div>
  );
};

export default ChatBubble;
