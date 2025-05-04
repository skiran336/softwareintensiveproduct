import axios from 'axios';

const API_URL = '/api/chat';

export const chatService = {
  async sendMessage(message, history = []) {
    try {
      const response = await axios.post(API_URL, {
        question: message,
        history: history
      });
      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }
}; 