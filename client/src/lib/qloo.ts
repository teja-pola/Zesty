import axios from 'axios';
const API_BASE = '/api/qloo';

export interface QlooEntity {
  id: string;
  name: string;
  type: string;
  metadata?: any;
}

export class QlooService {
  static async searchEntity(query: string, type: string): Promise<QlooEntity | null> {
    try {
      const response = await axios.get(`${API_BASE}/search`, {
        params: { query, type }
      });
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Qloo search error:', error);
      return null;
    }
  }

  static async getRecommendations(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      const response = await axios.post(`${API_BASE}/recommendations`, null, {
        params: { entityId, type }
      });
      return response.data || [];
    } catch (error) {
      console.error('Qloo recommendations error:', error);
      return [];
    }
  }

  static async getAntitheses(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      const response = await axios.get(`${API_BASE}/antitheses`, {
        params: { entityId, type }
      });
      return response.data || [];
    } catch (error) {
      console.error('Qloo antitheses error:', error);
      return [];
    }
  }
}
// static async getCrossDomainAffinity(entityIds: string[]): Promise<any> {
//   // Not implemented: This method is a placeholder and should be implemented if needed.
//   return null;
// }