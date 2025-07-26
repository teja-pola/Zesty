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

// ===== QLOO API PROXY =====

// Search entities
app.get('/api/qloo/search', async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query || !type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await axios.get(`${process.env.VITE_QLOO_BASE_URL}/search`, {
      params: { 
        query, 
        types: type.split(':').pop() 
      },
      headers: {
        'Authorization': `Bearer ${process.env.VITE_QLOO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search Qloo API' });
  }
});

// Get insights/recommendations
app.post('/api/qloo/insights', async (req, res) => {
  try {
    const { signal, filter } = req.body;
    
    if (!signal || !filter) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await axios.post(`${process.env.VITE_QLOO_BASE_URL}/v2/insights`, {
      signal,
      filter
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_QLOO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Qloo insights error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get insights from Qloo API' });
  }
});

// ===== GEMINI API PROXY =====

// Generate content
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const response = await axios.post(
      `${process.env.VITE_GEMINI_API_URL}?key=${process.env.VITE_GEMINI_API_KEY}`,
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