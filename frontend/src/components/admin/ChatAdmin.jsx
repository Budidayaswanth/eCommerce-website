import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { RiSendPlane2Fill, RiCustomerService2Line, RiUser3Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

const ChatAdmin = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadUnreadChats = async () => {
    try {
      const data = await adminService.getUnreadChats();
      // Group by sessionId
      const grouped = {};
      data.forEach((m) => {
        const sessId = m.sessionId || 'default';
        if (!grouped[sessId]) {
          grouped[sessId] = {
            id: sessId,
            userName: m.userName || `Customer #${m.userId || sessId.slice(-4)}`,
            phone: m.phone || 'In-App Guest',
            unreadCount: 0,
            lastMessage: m.message,
            time: m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            messages: [],
          };
        }
        grouped[sessId].unreadCount += 1;
        grouped[sessId].lastMessage = m.message;
      });

      const sessionList = Object.values(grouped);
      setSessions(sessionList);

      if (sessionList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessionList[0].id);
      }
    } catch {
      // ServerStatusIndicator handles connectivity alerts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadChats();
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;

    const fetchSessionThread = async () => {
      try {
        const history = await adminService.getSessionMessages(activeSessionId);
        setMessages(history);
      } catch {
        // Handled by global status indicator
      }
    };

    fetchSessionThread();
    const interval = setInterval(fetchSessionThread, 6000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId) return;

    const textToSend = replyText.trim();
    setSending(true);

    try {
      await adminService.adminReply(activeSessionId, textToSend);
      setReplyText('');
      toast.success('Reply dispatched to customer');
      // Refresh messages
      const updatedHistory = await adminService.getSessionMessages(activeSessionId);
      setMessages(updatedHistory);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || {
    id: activeSessionId,
    userName: activeSessionId ? `Session ${activeSessionId}` : 'Customer',
    phone: 'Active Live Thread',
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
          <div
            style={{
              padding: '16px',
              fontWeight: '700',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-primary-dark)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Active Conversations ({sessions.length})</span>
            <button
              onClick={loadUnreadChats}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '24px' }}>
              <Loader size="sm" message="Loading conversations..." />
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <RiCustomerService2Line size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No pending or unread chat sessions.</p>
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  setActiveSessionId(sess.id);
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
                    {sess.unreadCount} New
                  </span>
                )}
              </div>
            ))
          )}
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
                {activeSession.phone}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Select a conversation or await customer questions.
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.sender === 'ADMIN' || m.sender === 'BOT';
                return (
                  <div
                    key={m.id || Math.random()}
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
                      {m.sender === 'ADMIN' ? 'Support Specialist' : m.sender === 'BOT' ? 'Leo Bot' : (m.userName || 'Customer')}
                    </div>
                    {m.message}
                  </div>
                );
              })
            )}
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
              disabled={!activeSessionId || sending}
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
            <Button
              type="submit"
              variant="primary"
              disabled={!activeSessionId || sending || !replyText.trim()}
              icon={<RiSendPlane2Fill />}
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatAdmin;
