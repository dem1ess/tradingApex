import { instance } from './api';

export const UserService = {
  async getUserProfile(token) {
    const { data } = await instance.get('/auth/profile');
    data.token = token
    return data;
  },

  async verifyToken() {
    try {
      const { data } = await instance.post('/auth/verifyToken');
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
};
