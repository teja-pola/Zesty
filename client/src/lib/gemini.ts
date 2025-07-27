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

  /**
   * Generate a step-by-step curriculum plan for a domain.
   * This is a thin wrapper around generateContent so the
   * rest of the app can call GeminiService.generateCurriculumPlan
   * without TypeScript errors.
   */
  static async generateCurriculumPlan(
    preferences: string[],
    stepTitles: string[],
    domain: string
  ): Promise<string> {
    const prompt = `Create a short learning curriculum (max 6 bullet points) for someone who likes ${preferences.join(", ")} in the domain of ${domain}. The curriculum should cover these steps: ${stepTitles.join(", ")}.`;
    return this.generateContent(prompt);
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