



import { propertiesAPI } from './api';

export const propertyService = {
  
  getProperties: async (params = {}) => {
    return await propertiesAPI.getAll(params);
  },

  
  getFeaturedProperties: async () => {
    return await propertiesAPI.getFeatured();
  },

  
  getPropertyById: async (id) => {
    return await propertiesAPI.getById(id);
  },

  
  createProperty: async (propertyData) => {
    return await propertiesAPI.create(propertyData);
  },

  
  updateProperty: async (id, propertyData) => {
    return await propertiesAPI.update(id, propertyData);
  },

  
  deleteProperty: async (id) => {
    return await propertiesAPI.delete(id);
  },

  
  getUserProperties: async () => {
    return await propertiesAPI.getUserProperties();
  }
};
