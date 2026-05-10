



import { messagesAPI } from './api';

export const messageService = {
  
  getConversations: async () => {
    return await messagesAPI.getConversations();
  },

  
  getConversation: async (userId) => {
    return await messagesAPI.getConversation(userId);
  },

  
  sendMessage: async (data) => {
    return await messagesAPI.send(data);
  },

  
  getUnreadCount: async () => {
    return await messagesAPI.getUnreadCount();
  }
};
