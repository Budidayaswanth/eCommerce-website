import api from './api';

const getChatSessionId = () => {
  let sessId = localStorage.getItem('leo_chat_session_id');
  if (!sessId) {
    sessId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('leo_chat_session_id', sessId);
  }
  return sessId;
};

const chatService = {
  getSessionId() {
    return getChatSessionId();
  },

  async getMessages() {
    const sessionId = getChatSessionId();
    try {
      const response = await api.get(`/chat/messages/${sessionId}`);
      const rawList = response.data?.data || response.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((m) => ({
          id: m.id,
          sender: (m.sender || 'BOT').toLowerCase(),
          text: m.message,
          timestamp: m.sentAt || new Date().toISOString(),
        }));
      }
    } catch (err) {
      // Re-throw if network or DB issue so caller / status indicator is aware
      if (err.status) throw err;
    }

    return [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: 'Hello! Welcome to LEO PAINTS 🦁 How can we help you choose the right paints or estimate your room dimensions today?',
        timestamp: new Date().toISOString(),
      },
    ];
  },

  async sendMessage(text) {
    const sessionId = getChatSessionId();
    // Post user message to real backend
    await api.post('/chat/send', {
      message: text,
      sessionId,
    });

    // Fetch conversation thread from backend to get saved message and bot auto-reply
    const response = await api.get(`/chat/messages/${sessionId}`);
    const rawList = response.data?.data || response.data || [];
    const formatted = rawList.map((m) => ({
      id: m.id,
      sender: (m.sender || 'BOT').toLowerCase(),
      text: m.message,
      timestamp: m.sentAt || new Date().toISOString(),
    }));

    return formatted;
  },
};

export default chatService;
