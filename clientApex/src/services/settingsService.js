import { instance } from './api';

export const SettingsService = {
  async setWestWalletApiKeys(publicKey, privateKey) {
    console.log('Sending API keys:', { publicKey, privateKey });

    try {
      const response = await instance.post('/settings/westwallet-api-key', {
        publicKey,
        privateKey,
      });

      console.log('API keys set successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error setting API keys:', error);
      throw error;
    }
  },
};
