



import { authAPI } from './api';

export const authService = {
  
  getProfile: async () => {
    return await authAPI.getProfile();
  },

  
  updateProfile: async (data) => {
    return await authAPI.updateProfile(data);
  }
};
