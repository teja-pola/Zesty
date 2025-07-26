# 🌟 Zesty - Cultural Discovery Platform

A modern web application that helps users explore new cultural experiences through AI-powered recommendations and social challenges.

## 📁 Project Structure

```
Zesty/
├── 📁 client/                 # Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 pages/         # All UI components
│   │   ├── 📁 components/     # Reusable components
│   │   ├── 📁 lib/           # API services
│   │   └── 📁 hooks/         # Custom hooks
│   ├── 📄 package.json       # Frontend dependencies
│   └── 📄 vite.config.ts     # Vite configuration
├── 📁 server/                 # Backend (Express.js)
│   ├── 📄 index.js           # API proxy (164 lines)
│   └── 📄 package.json       # Server dependencies
├── 📁 supabase/              # Database & Auth
│   └── 📁 migrations/        # Database schema
├── 📄 package.json           # Root workspace config
├── 📄 env.example            # Environment variables template
└── 📄 README.md              # This file
```

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
# Install all dependencies (client + server)
npm run install:all
```

### 2. **Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit with your API keys
nano .env
```

### 3. **Run Development Server**
```bash
# Run both frontend and backend
npm run dev:full
```

## 📊 Available Scripts

| Script | Description | Port |
|--------|-------------|------|
| `npm run dev` | Frontend only | 5173 |
| `npm run server` | Backend only | 3001 |
| `npm run server:dev` | Backend with nodemon | 3001 |
| `npm run dev:full` | Both frontend & backend | 5173 + 3001 |
| `npm run build` | Build frontend for production | - |
| `npm run install:all` | Install all dependencies | - |

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Qloo API Configuration
VITE_QLOO_API_KEY=your_qloo_api_key_here
VITE_QLOO_BASE_URL=https://hackathon.api.qloo.com

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent

# Backend Configuration
VITE_BACKEND_URL=http://localhost:3001
VITE_CORS_ORIGIN=http://localhost:5173
```

## 🎯 Features

### ✅ **Authentication**
- Sign up/in with Supabase Auth
- Email confirmation flow
- Secure session management

### ✅ **Onboarding**
- Interactive taste preference collection
- Multi-step form with animations
- Cultural exposure score calculation

### ✅ **Explore**
- Swipeable cultural challenge cards
- AI-powered recommendations
- Integration with Qloo and Gemini APIs

### ✅ **Dashboard**
- Progress tracking with charts
- Cultural exposure analytics
- AI-generated insights

### ✅ **Connect**
- Taste nemesis matching
- Social challenges
- Progress sharing

### ✅ **Challenges**
- Track completed tasks
- Rate cultural experiences
- Share achievements

## 🔒 Security Features

- ✅ API keys secured in backend
- ✅ Rate limiting enabled
- ✅ Input sanitization
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Row Level Security (RLS)

## 🏗️ Architecture

```
Frontend (React) → Express Server → External APIs (Qloo, Gemini)
Frontend (React) → Supabase → Database & Auth
```

### **Client (Frontend)**
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context API
- **Routing**: React Router DOM
- **UI Components**: Lucide React icons

### **Server (Backend)**
- **Framework**: Express.js
- **Security**: Helmet, CORS, Rate limiting
- **API Proxy**: Qloo and Gemini APIs
- **Error Handling**: Centralized error management

### **Database**
- **Platform**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS)
- **Real-time**: Live updates

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔍 Verification

### **Backend Health Check**
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "qloo": "Available",
    "gemini": "Available"
  }
}
```

## 🛠️ Troubleshooting

### **Port Issues**
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### **Dependencies**
```bash
# Reinstall all dependencies
npm run install:all
```

### **Environment Variables**
```bash
# Check if .env exists
ls -la .env
```

## 🚀 Deployment

### **Development**
```bash
npm run dev:full
```

### **Production**
```bash
# Build frontend
npm run build

# Start server
npm run server
```

### **Deployment Platforms**
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: Supabase

## 📈 API Integration

### **Qloo API**
- Cultural entity search
- Recommendation insights
- Cross-domain affinity

### **Gemini AI**
- Content generation
- Cultural explanations
- Progress insights

### **Supabase**
- User authentication
- Data storage
- Real-time updates

## 🎨 UI/UX Features

- 🌙 Dark theme with gradients
- ✨ Smooth animations (Framer Motion)
- 📱 Responsive design
- 🎯 Intuitive navigation
- 🎨 Modern, attractive interface

## 🔧 Development

### **Adding New Features**
1. Create components in `client/src/components/`
2. Add pages in `client/src/pages/`
3. Update API services in `client/src/lib/`
4. Add backend endpoints in `server/index.js`

### **Database Changes**
1. Create migration in `supabase/migrations/`
2. Update types in `client/src/lib/supabase.ts`
3. Test with Supabase dashboard

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Zesty - Discover Your Cultural Horizons!** 🌟
