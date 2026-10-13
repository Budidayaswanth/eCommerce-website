import React, { useState, useEffect, useRef } from 'react';
import { RiQuestionAnswerFill, RiCloseLine, RiSendPlane2Fill, RiCustomerService2Line } from 'react-icons/ri';
import chatService from '../../services/chatService';
import ChatBubble from './ChatBubble';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      const msgs = await chatService.getMessages();
      setMessages(msgs);
    };
    if (isOpen) {
      fetchChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const text = inputVal.trim();
    setInputVal('');
    setIsTyping(true);

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await chatService.sendMessage(text);
      if (res?.botReply) {
        setMessages((prev) => [...prev, res.botReply]);
      }
    } catch (err) {
      // fallback
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) Bottom-Right */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 'var(--z-chat)',
        }}
        className="chat-fab-container"
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Leo Paints Support Chat"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(26, 35, 126, 0.4)',
              cursor: 'pointer',
              border: '2px solid var(--color-secondary)',
              transition: 'transform var(--transition-fast)',
            }}
            className="chat-fab-btn"
          >
            <RiQuestionAnswerFill size={28} />
          </button>
        )}
      </div>

      {/* Chat Window: 360px wide, 480px tall, z-index: 999 */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            height: '480px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 'var(--z-chat)',
          }}
          className="chat-window-box"
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-secondary)',
                }}
              >
                <RiCustomerService2Line size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9375rem', lineHeight: 1.2 }}>
                  Leo Support 🦁
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#C5CAE9' }}>
                  Online • Paint Advice & Estimates
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                color: '#FFFFFF',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close Chat"
            >
              <RiCloseLine size={22} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#F8FAFC',
            }}
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <ChatBubble isTyping />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Ask about shades, waterproofing..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                height: '38px',
                padding: '0 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                backgroundColor: 'var(--color-bg-page)',
              }}
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputVal.trim() ? 0.6 : 1,
              }}
              aria-label="Send message"
            >
              <RiSendPlane2Fill size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .chat-fab-btn:hover {
          transform: scale(1.1);
        }
        @media (max-width: 1024px) {
          .chat-fab-container {
            bottom: calc(var(--bottom-nav-height) + 16px) !important;
          }
          .chat-window-box {
            bottom: calc(var(--bottom-nav-height) + 16px) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
