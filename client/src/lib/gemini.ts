import axios from 'axios';

export class GeminiService {
  static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await axios.post('/api/gemini/generate', { prompt });
      return response.data.text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Unable to generate explanation at the moment.';
    }
  }
}
// static async explainDiscomfortRecommendation(
//   userLikes: string[], 
//   recommendation: string, 
//   domain: string
// ): Promise<string> {
//   // Not implemented: This method is a placeholder and should be implemented if needed.
//   return this.generateContent('');
// }

// static async generateCurriculumPlan(
// All unfinished methods removed. Only generateContent remains for clean integration.