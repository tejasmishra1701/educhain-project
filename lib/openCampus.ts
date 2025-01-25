import axios from 'axios';

export interface OpenCampusUser {
  username: string;
  walletAddress: string;
  credentials: string[];
}

export const openCampusService = {
  async getLinkedProfile(walletAddress: string): Promise<OpenCampusUser | null> {
    try {
      const response = await axios.get(⁠ https://api.opencampus.id/profile/${walletAddress} ⁠);
      return response.data;
    } catch (error) {
      console.error('Open Campus Profile Fetch Failed', error);
      return null;
    }
  },

  async validateCredentials(username: string): Promise<boolean> {
    try {
      const response = await axios.get(⁠ https://api.opencampus.id/validate/${username} ⁠);
      return response.data.isValid;
    } catch (error) {
      return false;
    }
  }
};