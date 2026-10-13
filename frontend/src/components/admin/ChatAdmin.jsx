import React, { useState } from 'react';
import Button from '../common/Button';
import { RiSendPlane2Fill, RiUser3Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

const MOCK_SESSIONS = [
  {
    id: 'chat-sess-1',
    userName: 'Karthik Sharma',
    phone: '9845012345',
    unreadCount: 1,
    lastMessage: 'Can Royale Emulsion be applied over chalky distemper without scraping?',
    time: '10:14 AM',
    messages: [
      { sender: 'user', text: 'Hi, I need assistance with our living room repaint.' },
      { sender: 'bot', text: 'Hello Karthik! How can we help today?' },
      { sender: 'user', text: 'Can Royale Emulsion be applied over chalky distemper without scraping?' },
    ],
  },
  {
    id: 'chat-sess-2',
    userName: 'Anita Roy',
    phone: '9712345678',
    unreadCount: 0,
    lastMessage: 'Thank you! The estimate was very accurate.',
    time: 'Yesterday',
    messages: [
      { sender: 'user', text: 'Needed to calculate liters for 3 bedrooms.' },
      { sender: 'admin', text: 'Based on 450 sq.ft, you need around 7 Litres for 2 coats.' },
      { sender: 'user', text: 'Thank you! The estimate was very accurate.' },
    ],
  },
];

const ChatAdmin = () => {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState(MOCK_SESSIONS[0].id);
  const [replyText, setReplyText] = useState('');

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = { sender: 'admin', text: replyText.trim() };
    setSessions(
      sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              unreadCount: 0,
              lastMessage: replyText.trim(),
              messages: [...s.messages, newMsg],
            }
          : s
      )
    );
    setReplyText('');
    toast.success('Reply dispatched to customer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 140px)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          Live Customer Support Helpdesk
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Real-time inquiries, shade consultations, and contractor support tickets.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Left: Chat Sessions List */}
        <div style={{ borderRight: '1px solid var(--color-border)', overflowY: 'auto' }}>
          <div style={{ padding: '16px', fontWeight: '700', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary-dark)' }}>
            Active Conversations ({sessions.length})
          </div>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => {
                setActiveSessionId(sess.id);
                // Mark read
                setSessions(sessions.map((s) => (s.id === sess.id ? { ...s, unreadCount: 0 } : s)));
              }}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border-light)',
                cursor: 'pointer',
                backgroundColor: activeSessionId === sess.id ? 'var(--color-primary-subtle)' : '#FFFFFF',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{sess.userName}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{sess.time}</span>
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {sess.lastMessage}
              </div>
              {sess.unreadCount > 0 && (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-accent)',
                    color: '#fff',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    marginTop: '6px',
                  }}
                >
                  {sess.unreadCount} Unread
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right: Message Thread & Reply */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                {activeSession.userName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Phone: +91 {activeSession.phone}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSession.messages.map((m, idx) => {
              const isAdmin = m.sender === 'admin' || m.sender === 'bot';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isAdmin ? 'var(--color-primary)' : '#FFFFFF',
                    color: isAdmin ? '#FFFFFF' : 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-xs)',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginBottom: '2px' }}>
                    {m.sender === 'admin' ? 'Support Specialist' : m.sender === 'bot' ? 'Leo Bot' : activeSession.userName}
                  </div>
                  {m.text}
                </div>
              );
            })}
          </div>

          {/* Reply Input */}
          <form
            onSubmit={handleSendReply}
            style={{
              padding: '14px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <input
              type="text"
              placeholder="Type professional paint consultant response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                flex: 1,
                height: '42px',
                padding: '0 14px',
                borderRadius: 'var(--radius-btn)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
              }}
            />
            <Button type="submit" variant="primary" icon={<RiSendPlane2Fill />}>
              Send Reply
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatAdmin;
