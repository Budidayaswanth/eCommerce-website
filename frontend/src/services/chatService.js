import api from './api';

let localChatHistory = [
  {
    id: 'msg-init-1',
    sender: 'bot',
    text: 'Hello! Welcome to LEO PAINTS 🦁 How can we help you choose the right paints or estimate your room dimensions today?',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

const AUTO_REPLIES = [
  'Thank you for reaching out! Our paint specialist will recommend the ideal primer and finish for your wall condition.',
  'Did you know? You can use our Paint Calculator in the product page to determine exact liters needed!',
  'All Leo Paints emulsions come with Low-VOC formulation and 100% lead-free pigment guarantee.',
  'Our shipping is super fast! Orders placed before 2 PM are dispatched the same business day.',
];

const chatService = {
  async getMessages() {
    try {
      const response = await api.get('/chat/messages');
      if (response.data && response.data.length > 0) return response.data;
    } catch {}
    return localChatHistory;
  },

  async sendMessage(text) {
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    localChatHistory.push(userMsg);

    try {
      await api.post('/chat/messages', { text });
    } catch {}

    // Simulated smart assistant response
    const botReply = {
      id: `msg-bot-${Date.now() + 1}`,
      sender: 'bot',
      text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        localChatHistory.push(botReply);
        resolve({ userMessage: userMsg, botReply });
      }, 700);
    });
  },
};

export default chatService;
