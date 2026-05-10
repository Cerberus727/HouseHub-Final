



import { bookmarksAPI } from './api';

export const bookmarkService = {
  
  getBookmarks: async () => {
    return await bookmarksAPI.getAll();
  },

  
  toggleBookmark: async (propertyId) => {
    return await bookmarksAPI.toggle(propertyId);
  },

  
  checkBookmark: async (propertyId) => {
    return await bookmarksAPI.check(propertyId);
  }
};
