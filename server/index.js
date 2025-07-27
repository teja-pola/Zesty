

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';
import rateLimit from 'express-rate-limit';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Remove mock endpoint - using real implementation below

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.VITE_CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[<>]/g, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
};
app.use(sanitizeInput);

// ===== QLOO HACKATHON API PROXY =====

const QLOO_BASE_URL = "https://hackathon.api.qloo.com";
const QLOO_API_KEY = process.env.VITE_QLOO_API_KEY;

// Validate API keys on startup
if (!QLOO_API_KEY) {
  console.warn('⚠️  QLOO API KEY not found in environment variables');
}

// Main recommendations endpoint - combines search + insights
app.get('/api/qloo/recommendations', async (req, res) => {
  const { query, type } = req.query;

  try {
    // Step 1: Search for entity
    const searchResp = await axios.get(`${QLOO_BASE_URL}/search`, {
      params: { query, types: type.split(":").pop() },
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      },
    });

    const entity = searchResp.data.results?.[0];
    if (!entity) return res.status(404).json({ message: "Entity not found" });

    const entityId = entity.id;

    // Step 2: Get insights
    const insightsResp = await axios.post(
      `${QLOO_BASE_URL}/v2/insights`,
      {
        signal: { interests: { entities: [entityId] } },
        filter: { type },
      },
      {
        headers: {
          'X-Api-Key': QLOO_API_KEY,
          'Content-Type': 'application/json'
        },
      }
    );

    res.json(insightsResp.data.related);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// Search entities endpoint
app.get('/api/qloo/search', async (req, res) => {
  try {
    const { query, types } = req.query;
    
    if (!query || !types) {
      return res.status(400).json({ error: 'Missing required parameters: query and types' });
    }

    // If no API key, return mock data
    if (!QLOO_API_KEY) {
      return res.json({
        results: [{
          id: `mock-${types}-${Date.now()}`,
          name: query,
          type: `urn:entity:${types}`,
          properties: { mock: true }
        }]
      });
    }

    const response = await axios.get(`${QLOO_BASE_URL}/search`, {
      params: { query, types },
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo search error:', error.response?.data || error.message);
    // Return mock data on API failure
    res.json({
      results: [{
        id: `mock-${req.query.types}-${Date.now()}`,
        name: req.query.query,
        type: `urn:entity:${req.query.types}`,
        properties: { mock: true, error: 'API unavailable' }
      }]
    });
  }
});

// Get insights/recommendations endpoint
app.post('/api/qloo/insights', async (req, res) => {
  try {
    const { signal, filter } = req.body;
    
    if (!signal || !filter) {
      return res.status(400).json({ error: 'Missing required parameters: signal and filter' });
    }

    const response = await axios.post(`${QLOO_BASE_URL}/v2/insights`, {
      signal,
      filter
    }, {
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo insights error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get insights from Qloo API' });
  }
});

// Get affinity cluster for taste mapping
app.get('/api/qloo/affinity-cluster', async (req, res) => {
  try {
    const { entities } = req.query;
    
    if (!entities) {
      return res.status(400).json({ error: 'Missing required parameter: entities' });
    }

    const response = await axios.get(`${QLOO_BASE_URL}/affinity-cluster`, {
      params: { entities },
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo affinity-cluster error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get affinity cluster from Qloo API' });
  }
});

// Get antitheses (opposite recommendations)
app.post('/api/qloo/antitheses', async (req, res) => {
  try {
    const { entities, type } = req.body;
    
    if (!entities || !type) {
      return res.status(400).json({ error: 'Missing required parameters: entities and type' });
    }

    const response = await axios.post(`${QLOO_BASE_URL}/recipes/antitheses`, {
      entities,
      type
    }, {
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo antitheses error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get antitheses from Qloo API' });
  }
});

// Get cross-domain affinity for bridge content
app.get('/api/qloo/cross-domain-affinity', async (req, res) => {
  try {
    const { source_entities, target_type } = req.query;
    
    if (!source_entities || !target_type) {
      return res.status(400).json({ error: 'Missing required parameters: source_entities and target_type' });
    }

    const response = await axios.get(`${QLOO_BASE_URL}/cross-domain-affinity`, {
      params: { source_entities, target_type },
      headers: {
        'X-Api-Key': QLOO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo cross-domain-affinity error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get cross-domain affinity from Qloo API' });
  }
});

// ===== GEMINI API PROXY =====

const GEMINI_API_URL = process.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Generate content with Gemini
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

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

    res.json({ 
      text: response.data.candidates[0].content.parts[0].text 
    });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate content with Gemini' });
  }
});

// ===== ZESTY CORE ENDPOINTS =====

// Generate discomfort cards using Qloo + LLM
app.post('/api/zesty/generate-cards', async (req, res) => {
  try {
    const { userPreferences, domains = ['movie', 'music', 'book', 'food'] } = req.body;
    
    if (!userPreferences || !Array.isArray(userPreferences)) {
      return res.status(400).json({ error: 'Invalid user preferences' });
    }

    const cards = [];
    
    // Enhanced mock data with more variety for better challenges
    const enhancedMockData = {
      movie: [
        { name: 'Stalker (1979)', genre: 'Soviet Sci-Fi', difficulty: 5 },
        { name: 'The Tree of Life', genre: 'Experimental Drama', difficulty: 4 },
        { name: 'Persona', genre: 'Psychological Art Film', difficulty: 5 },
        { name: 'Mulholland Drive', genre: 'Surreal Mystery', difficulty: 4 },
        { name: 'Jeanne Dielman', genre: 'Minimalist Drama', difficulty: 5 },
        { name: 'Satantango', genre: 'Long-form Art Cinema', difficulty: 5 }
      ],
      music: [
        { name: 'Mongolian Throat Singing', genre: 'Traditional World', difficulty: 3 },
        { name: 'Free Jazz', genre: 'Experimental Jazz', difficulty: 4 },
        { name: 'Drone Metal', genre: 'Extreme Metal', difficulty: 4 },
        { name: 'Gamelan Orchestra', genre: 'Indonesian Traditional', difficulty: 3 },
        { name: 'Noise Music', genre: 'Experimental Electronic', difficulty: 5 },
        { name: 'Microtonal Compositions', genre: 'Contemporary Classical', difficulty: 5 }
      ],
      book: [
        { name: 'Finnegans Wake', genre: 'Experimental Literature', difficulty: 5 },
        { name: 'Being and Time', genre: 'Philosophy', difficulty: 5 },
        { name: 'Gravity\'s Rainbow', genre: 'Postmodern Fiction', difficulty: 4 },
        { name: 'The Phenomenology of Spirit', genre: 'German Idealism', difficulty: 5 },
        { name: 'Ulysses', genre: 'Modernist Literature', difficulty: 4 },
        { name: 'The Book of Disquiet', genre: 'Fragmentary Prose', difficulty: 4 }
      ],
      food: [
        { name: 'Fermented Shark (Hákarl)', genre: 'Icelandic Delicacy', difficulty: 5 },
        { name: 'Durian Fruit', genre: 'Southeast Asian Fruit', difficulty: 4 },
        { name: 'Century Eggs', genre: 'Chinese Preserved Food', difficulty: 4 },
        { name: 'Casu Marzu Cheese', genre: 'Italian Aged Cheese', difficulty: 5 },
        { name: 'Balut', genre: 'Filipino Street Food', difficulty: 5 },
        { name: 'Surströmming', genre: 'Swedish Fermented Fish', difficulty: 5 }
      ]
    };
    
    // Generate 3-4 cards per domain for variety (total 12-16 cards)
    for (const domain of domains) {
      try {
        // Get user preferences for this domain
        const domainPrefs = userPreferences.filter(pref => pref.type === domain);
        let qlooChallenges = [];
        
        // Try real Qloo API first for better recommendations
        if (QLOO_API_KEY && domainPrefs.length > 0) {
          try {
            const userPrefNames = domainPrefs.map(p => p.name).slice(0, 2);
            
            for (const prefName of userPrefNames) {
              try {
                // First, search for the entity
                const searchResponse = await axios.get(`${QLOO_BASE_URL}/search`, {
                  params: { 
                    query: prefName, 
                    types: domain === 'movie' ? 'tv_show,movie' : domain
                  },
                  headers: {
                    'X-Api-Key': QLOO_API_KEY,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (searchResponse.data.results && searchResponse.data.results.length > 0) {
                  const entityId = searchResponse.data.results[0].id;
                  
                  // Get antitheses using v2/insights
                  const insightsResponse = await axios.post(`${QLOO_BASE_URL}/v2/insights`, {
                    input: [entityId],
                    insight_type: 'antitheses',
                    count: 2
                  }, {
                    headers: {
                      'X-Api-Key': QLOO_API_KEY,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (insightsResponse.data.results) {
                    insightsResponse.data.results.forEach(result => {
                      qlooChallenges.push({
                        name: result.name || result.id,
                        id: result.id,
                        type: domain,
                        qloo_data: result
                      });
                    });
                  }
                }
              } catch (entityError) {
                console.log(`Qloo entity search failed for ${prefName}:`, entityError.message);
              }
            }
          } catch (qlooError) {
            console.log('Qloo API failed, using enhanced mock data:', qlooError.message);
          }
        }
        
        // Use Qloo data if available, otherwise use enhanced mock data
        const challengesToUse = qlooChallenges.length > 0 ? qlooChallenges : 
          (enhancedMockData[domain] || []).slice(0, 4);
        
        // Generate cards from challenges
        challengesToUse.forEach((challenge, idx) => {
          const userPref = domainPrefs.length > 0 ? domainPrefs[0].name : `mainstream ${domain}`;
          const isQlooData = !!challenge.qloo_data;
          
          cards.push({
            id: isQlooData ? `qloo-${domain}-${challenge.id}` : `mock-${domain}-${challenge.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: challenge.name,
            type: domain,
            image: challenge.qloo_data?.image_url || null,
            metadata: isQlooData ? { qloo: true, ...challenge.qloo_data } : { mock: true, genre: challenge.genre },
            explanation: `Since you enjoy ${userPref}, trying "${challenge.name}" will challenge your comfort zone significantly. This ${challenge.genre || domain} represents a completely different aesthetic that could dramatically broaden your cultural understanding and push you into unexplored territory.`,
            discomfort_level: challenge.difficulty || (3 + idx),
            growth_benefit: domain === 'movie' ? 'Cinematic appreciation & cultural literacy' : 
                           domain === 'music' ? 'Musical diversity & auditory expansion' : 
                           domain === 'book' ? 'Literary exploration & intellectual growth' : 
                           'Culinary adventure & cultural immersion',
            created_at: new Date().toISOString()
          });
        });
        
      } catch (domainError) {
        console.error(`Error generating cards for ${domain}:`, domainError.message);
        // Add fallback cards
        ['Challenge 1', 'Challenge 2'].forEach((name, idx) => {
          cards.push({
            id: `fallback-${domain}-${idx}-${Date.now()}`,
            name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} ${name}`,
            type: domain,
            image: null,
            metadata: { fallback: true },
            explanation: `Step outside your ${domain} comfort zone and discover something completely new.`,
            discomfort_level: 3,
            growth_benefit: 'Cultural expansion',
            created_at: new Date().toISOString()
          });
        });
      }
    }
    
    // Ensure we have at least 10 cards total
    while (cards.length < 10) {
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      cards.push({
        id: `bonus-${randomDomain}-${Date.now()}-${cards.length}`,
        name: `Bonus ${randomDomain.charAt(0).toUpperCase() + randomDomain.slice(1)} Challenge`,
        type: randomDomain,
        image: null,
        metadata: { bonus: true },
        explanation: `An extra challenge to push your ${randomDomain} boundaries even further.`,
        discomfort_level: 4,
        growth_benefit: 'Extended cultural exploration',
        created_at: new Date().toISOString()
      });
    }
    
    // Shuffle cards for variety
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    
    res.json({ cards: shuffledCards, total: shuffledCards.length });
  } catch (error) {
    console.error('Generate cards error:', error.message);
    res.status(500).json({ error: 'Failed to generate discomfort cards' });
  }
});

// Generate onboarding report
app.post('/api/zesty/onboarding-report', async (req, res) => {
  try {
    const { preferences, userName } = req.body;
    
    if (!preferences || !userName) {
      return res.status(400).json({ error: 'Missing preferences or userName' });
    }

    // Create a comprehensive report based on preferences
    const allPrefs = Object.entries(preferences).flatMap(([domain, items]) => 
      items.map(item => `${domain}: ${item}`)
    ).join(', ');

    let report = {
      cultural_profile: `You have diverse interests spanning ${Object.keys(preferences).join(', ')}. Your taste profile shows a preference for ${allPrefs.split(', ').slice(0, 3).join(', ')}, indicating an openness to mainstream culture with potential for exciting growth into unexplored territories.`,
      growth_areas: [
        "International and art house cinema",
        "World music and experimental genres", 
        "Global literature and non-fiction",
        "International cuisine and fusion foods",
        "Alternative fashion and cultural styles"
      ],
      recommended_challenges: [
        "Watch a foreign film with subtitles",
        "Listen to music from a culture you've never explored",
        "Read a book by an author from a different continent",
        "Try cooking a dish from a cuisine you've never attempted",
        "Experiment with a fashion style outside your comfort zone"
      ],
      motivation_message: `${userName}, your journey into cultural discomfort will expand your worldview and deepen your empathy. Every challenge you accept is a step toward becoming a more culturally intelligent and open-minded person. Embrace the discomfort – it's where growth happens!`
    };

    // Try Gemini API for better personalization, but don't fail if it doesn't work
    if (GEMINI_API_KEY) {
      try {
        const prompt = `Create a personalized cultural growth report for ${userName}. Their preferences are: ${JSON.stringify(preferences)}. Generate a JSON response with: {"cultural_profile": "2-3 sentence summary", "growth_areas": ["area1", "area2", "area3"], "recommended_challenges": ["challenge1", "challenge2", "challenge3"], "motivation_message": "encouraging message"}`;
        
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{ text: prompt }]
            }]
          }
        );
        
        const geminiText = response.data.candidates[0].content.parts[0].text;
        try {
          const geminiReport = JSON.parse(geminiText);
          report = { ...report, ...geminiReport }; // Merge with default report
        } catch (parseError) {
          console.log('Gemini response parsing failed, using default report');
        }
      } catch (geminiError) {
        console.log('Gemini API failed, using default report');
      }
    }
    
    res.json(report);
  } catch (error) {
    console.error('Onboarding report error:', error.message);
    // Return a basic report even if everything fails
    res.json({
      cultural_profile: "You have interesting cultural preferences with great potential for growth.",
      growth_areas: ["International experiences", "Diverse media consumption", "Cultural exploration"],
      recommended_challenges: ["Try something completely new", "Explore unfamiliar cultures", "Step outside your comfort zone"],
      motivation_message: "Every step outside your comfort zone is a step toward personal growth!"
    });
  }
});

// Find cultural nemesis (opposite taste profile)
app.post('/api/zesty/find-nemesis', async (req, res) => {
  try {
    const { userPreferences, userId } = req.body;
    
    if (!userPreferences || !userId) {
      return res.status(400).json({ error: 'Missing userPreferences or userId' });
    }

    // This would typically query a user database to find opposite profiles
    // For now, we'll simulate nemesis matching logic
    const mockNemesis = {
      id: `nemesis_${Date.now()}`,
      name: "Cultural Explorer",
      opposite_preferences: userPreferences.map(pref => ({
        ...pref,
        name: `Anti-${pref.name}`,
        reason: "Completely opposite taste profile"
      })),
      compatibility_score: 0.15, // Low compatibility = good nemesis
      challenge_count: Math.floor(Math.random() * 50) + 10
    };
    
    res.json({ nemesis: mockNemesis });
  } catch (error) {
    console.error('Find nemesis error:', error.message);
    res.status(500).json({ error: 'Failed to find cultural nemesis' });
  }
});

// Generate growth reflection
app.post('/api/zesty/growth-reflection', async (req, res) => {
  try {
    const { completedChallenges, userName } = req.body;
    
    if (!completedChallenges || !userName) {
      return res.status(400).json({ error: 'Missing completedChallenges or userName' });
    }

    const prompt = `${userName} has completed these cultural challenges: ${JSON.stringify(completedChallenges)}. Write a thoughtful reflection on their growth journey. Include insights about what they've learned and suggest next steps. Format as JSON: {"reflection": "your reflection", "growth_insights": ["insight1", "insight2"], "next_challenges": ["challenge1", "challenge2"]}`;
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );
    
    let reflection;
    try {
      reflection = JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch {
      reflection = {
        reflection: "You've shown remarkable courage in stepping outside your comfort zone.",
        growth_insights: ["Increased cultural awareness", "Greater empathy for different perspectives"],
        next_challenges: ["Explore a new art form", "Try cuisine from a different continent"]
      };
    }
    
    res.json(reflection);
  } catch (error) {
    console.error('Growth reflection error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate growth reflection' });
  }
});

// ===== HEALTH CHECK =====

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      qloo: 'Available',
      gemini: 'Available'
    }
  });
});

// ===== ERROR HANDLING =====

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`🚀 Zesty API Server running on port ${PORT}`);
  console.log(`🔒 Security: Helmet, CORS, Rate limiting, Input sanitization`);
  console.log(`📡 Proxying: Qloo API, Gemini AI`);
});