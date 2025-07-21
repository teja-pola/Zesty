import axios from 'axios';

const QLOO_BASE_URL = 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = '_qxAPaYM59dU2kzfRrJwY5wcF0YOC_XNzaMU0cs7P0Q';

const qlooApi = axios.create({
  baseURL: QLOO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${QLOO_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface QlooEntity {
  id: string;
  name: string;
  type: string;
  metadata?: any;
}

export class QlooService {
  static async searchEntity(query: string, type: string): Promise<QlooEntity | null> {
    try {
      const response = await qlooApi.get('/search', {
        params: { 
          query, 
          types: type.split(':').pop() 
        }
      });
      
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('Qloo search error:', error);
      return null;
    }
  }

  static async getRecommendations(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      const response = await qlooApi.post('/v2/insights', {
        signal: { 
          interests: { 
            entities: [entityId] 
          } 
        },
        filter: { type }
      });
      
      return response.data.related || [];
    } catch (error) {
      console.error('Qloo recommendations error:', error);
      return [];
    }
  }

  static async getAntitheses(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      // Using insights with negative signal for discomfort recommendations
      const response = await qlooApi.post('/v2/insights', {
        signal: { 
          interests: { 
            entities: [entityId] 
          } 
        },
        filter: { 
          type,
          limit: 10
        }
      });
      
      // Return results that are contextually different
      return response.data.related?.slice(-5) || [];
    } catch (error) {
      console.error('Qloo antitheses error:', error);
      return [];
    }
  }

  static async getCrossDomainAffinity(entityIds: string[]): Promise<any> {
    try {
      const response = await qlooApi.post('/v2/insights', {
        signal: { 
          interests: { 
            entities: entityIds 
          } 
        },
        filter: {
          types: ['movie', 'music', 'food', 'book', 'fashion']
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Qloo cross-domain error:', error);
      return null;
    }
  }
}