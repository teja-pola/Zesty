import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('sb-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('sb-token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface QlooEntity {
  id: string;
  name: string;
  type: string;
  metadata?: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number;
  culturalContext: string;
  isCompleted: boolean;
  userRating?: number;
  createdAt: string;
  completedAt?: string;
}

export interface UserPreferences {
  music: string[];
  movies: string[];
  books: string[];
  food: string[];
  fashion: string[];
}

export interface ProcessedPreferences {
  culturalExposureScore: number;
  discomfortLevel: number;
  domainsUnlocked: string[];
  tasteProfile: UserPreferences;
}

export class ApiService {
  // ===== QLOO API METHODS =====
  
  static async searchEntity(query: string, type: string): Promise<QlooEntity | null> {
    try {
      const response = await apiClient.get('/api/qloo/search', {
        params: { query, type }
      });
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('API search error:', error);
      return null;
    }
  }

  static async getRecommendations(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      const response = await apiClient.post('/api/qloo/insights', {
        signal: { 
          interests: { 
            entities: [entityId] 
          } 
        },
        filter: { type }
      });
      return response.data.related || [];
    } catch (error) {
      console.error('API recommendations error:', error);
      return [];
    }
  }

  static async getAntitheses(entityId: string, type: string): Promise<QlooEntity[]> {
    try {
      const response = await apiClient.post('/api/qloo/insights', {
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
      return response.data.related?.slice(-5) || [];
    } catch (error) {
      console.error('API antitheses error:', error);
      return [];
    }
  }

  // ===== GEMINI API METHODS =====
  
  static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post('/api/gemini/generate', { prompt });
      return response.data.text;
    } catch (error) {
      console.error('API content generation error:', error);
      return 'Unable to generate content at the moment.';
    }
  }

  static async explainDiscomfortRecommendation(
    userLikes: string[], 
    recommendation: string, 
    domain: string
  ): Promise<string> {
    const prompt = `You are a cultural mentor helping someone expand their taste. 
    A user who likes ${userLikes.join(', ')} in ${domain} is being recommended "${recommendation}" which is very different from their usual preferences.
    
    Explain in 2-3 sentences why experiencing this different content would be valuable for their cultural growth. Be encouraging but honest about the challenge.
    
    Format: Keep it conversational and inspiring.`;

    return this.generateContent(prompt);
  }

  static async generateChallengeTask(domain: string, difficulty: number): Promise<{
    title: string;
    description: string;
    culturalContext: string;
  }> {
    const prompt = `Generate a ${domain} cultural exploration challenge for difficulty level ${difficulty}/5.
    
    The challenge should:
    - Be specific and actionable
    - Push cultural boundaries appropriately for the difficulty level
    - Be respectful of all cultures
    - Include clear cultural learning value
    
    Return in this JSON format:
    {
      "title": "Challenge title",
      "description": "What the user needs to do",
      "culturalContext": "Why this is culturally enriching"
    }
    
    Make it specific, doable, and culturally educational. Avoid stereotypes and focus on authentic cultural experiences.`;

    try {
      const response = await this.generateContent(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch {
      return {
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Cultural Discovery`,
        description: `Explore a new aspect of ${domain} that challenges your current preferences and expands your cultural understanding.`,
        culturalContext: `Engaging with unfamiliar ${domain} helps develop cultural empathy and broadens your aesthetic appreciation.`
      };
    }
  }

  static async generateProgressInsight(
    previousScore: number, 
    currentScore: number, 
    completedChallenges: string[]
  ): Promise<string> {
    const prompt = `A user's cultural exposure score increased from ${previousScore} to ${currentScore}. 
    They recently completed these challenges: ${completedChallenges.join(', ')}.
    
    Write an encouraging 2-sentence insight about their cultural growth journey. 
    Be specific about their progress and motivate them to continue exploring.`;

    return this.generateContent(prompt);
  }

  // ===== HEALTH CHECK =====
  
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/health');
      return response.data.status === 'OK';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
} 