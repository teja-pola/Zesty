import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyBlkTKWe-BZqXtyHWQDfERdSq5HXDulXAI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

export class GeminiService {
  static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Unable to generate explanation at the moment.';
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

  static async generateCurriculumPlan(
    currentTastes: string[], 
    targetTastes: string[], 
    domain: string
  ): Promise<string> {
    const prompt = `Create a 5-step cultural journey plan for someone who currently enjoys ${currentTastes.join(', ')} in ${domain} 
    and wants to gradually appreciate ${targetTastes.join(', ')}.
    
    Provide a progressive path with titles and brief explanations for each step.
    Make it feel like an exciting adventure, not homework.
    
    Format as a numbered list with brief explanations.`;

    return this.generateContent(prompt);
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

  static async generateChallengeTask(domain: string, difficulty: number): Promise<{
    title: string;
    description: string;
    culturalContext: string;
  }> {
    const difficultyLabels = ['Gentle', 'Mild', 'Medium', 'Challenging', 'Intense'];
    const difficultyLabel = difficultyLabels[difficulty - 1] || 'Medium';
    
    const prompt = `Generate a ${domain} cultural exploration challenge for difficulty level ${difficulty}/5 (${difficultyLabel}).
    
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
      // Try to parse JSON, but handle potential formatting issues
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch {
      // Enhanced fallback with domain-specific challenges
      return {
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Cultural Discovery`,
        description: `Explore a new aspect of ${domain} that challenges your current preferences and expands your cultural understanding.`,
        culturalContext: `Engaging with unfamiliar ${domain} helps develop cultural empathy and broadens your aesthetic appreciation.`
      };
    }
  }
}