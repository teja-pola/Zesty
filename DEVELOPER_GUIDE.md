# 🛠️ Zesty Developer Guide

## 📁 **Organized Folder Structure**

```
Zesty/
├── 📁 client/                 # Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 pages/         # All UI components
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Challenges.tsx
│   │   │   ├── Connect.tsx
│   │   │   └── Progress.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── 📁 Auth/
│   │   │       └── ProtectedRoute.tsx
│   │   ├── 📁 lib/
│   │   │   ├── api.ts         # API service
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   ├── qloo.ts        # Qloo API (legacy)
│   │   │   └── gemini.ts      # Gemini API (legacy)
│   │   └── 📁 hooks/
│   │       └── useAuth.tsx    # Authentication hook
│   ├── 📄 package.json        # Frontend dependencies
│   ├── 📄 vite.config.ts      # Vite configuration
│   └── 📄 index.html          # Entry point
├── 📁 server/                 # Backend (Express.js)
│   ├── 📄 index.js            # API proxy (164 lines)
│   └── 📄 package.json        # Server dependencies
├── 📁 supabase/              # Database & Auth
│   └── 📁 migrations/        # Database schema
├── 📄 package.json           # Root workspace config
├── 📄 env.example            # Environment variables template
└── 📄 README.md              # Project documentation
```

## 🚀 **How to Run**

### **Quick Start**
```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cp env.example .env
# Edit .env with your API keys

# 3. Run the application
npm run dev:full
```

### **Individual Services**
```bash
# Frontend only (port 5173)
npm run dev

# Backend only (port 3001)
npm run server:dev

# Both frontend and backend
npm run dev:full
```

## 📊 **Available Scripts**

| Script | Description | Location |
|--------|-------------|----------|
| `npm run dev` | Frontend only | Root |
| `npm run server` | Backend only | Root |
| `npm run server:dev` | Backend with nodemon | Root |
| `npm run dev:full` | Both frontend & backend | Root |
| `npm run build` | Build frontend for production | Root |
| `npm run install:all` | Install all dependencies | Root |

## 🔧 **Development Workflow**

### **Adding New Features**

1. **Frontend Components**
   ```bash
   # Create new component
   touch client/src/components/NewComponent.tsx
   
   # Create new page
   touch client/src/pages/NewPage.tsx
   ```

2. **Backend Endpoints**
   ```bash
   # Add to server/index.js
   app.get('/api/new-endpoint', async (req, res) => {
     // Your logic here
   });
   ```

3. **Database Changes**
   ```bash
   # Create migration
   touch supabase/migrations/new_migration.sql
   ```

### **File Organization**

#### **Client Structure**
- `src/pages/` - All page components
- `src/components/` - Reusable UI components
- `src/lib/` - API services and utilities
- `src/hooks/` - Custom React hooks

#### **Server Structure**
- `index.js` - All API endpoints
- `package.json` - Server dependencies

#### **Database Structure**
- `supabase/migrations/` - Database schema changes

## 🔍 **Import Paths**

### **Client Imports**
```typescript
// Pages
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';

// Components
import { Header } from './components/Layout/Header';

// Services
import { ApiService } from './lib/api';
import { supabase } from './lib/supabase';

// Hooks
import { useAuth } from './hooks/useAuth';
```

### **Server Imports**
```javascript
// Dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';
```

## 🔒 **Security Features**

### **Frontend Security**
- ✅ Environment variables for API keys
- ✅ Input validation and sanitization
- ✅ Secure authentication flow

### **Backend Security**
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Error handling

### **Database Security**
- ✅ Row Level Security (RLS)
- ✅ Authentication policies
- ✅ Data validation

## 🎯 **API Integration**

### **Qloo API (Cultural Data)**
```typescript
// Search entities
const entity = await ApiService.searchEntity('query', 'type');

// Get recommendations
const recommendations = await ApiService.getRecommendations(entityId, type);

// Get antitheses
const antitheses = await ApiService.getAntitheses(entityId, type);
```

### **Gemini AI (Content Generation)**
```typescript
// Generate content
const content = await ApiService.generateContent(prompt);

// Generate challenge
const challenge = await ApiService.generateChallengeTask(domain, difficulty);

// Generate insights
const insight = await ApiService.generateProgressInsight(prevScore, currentScore, challenges);
```

### **Supabase (Database & Auth)**
```typescript
// Authentication
const { user } = useAuth();

// Database operations
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);
```

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Port Already in Use**
   ```bash
   lsof -ti:3001 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Missing Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Variables**
   
   # Verify variables are loaded
   echo $VITE_SUPABASE_URL


4. **Import Errors**
   ```bash
   # Check TypeScript compilation
   cd client && npm run build
   ```

### **Debugging**

1. **Frontend Issues**
   - Check browser console
   - Verify API calls in Network tab
   - Check React DevTools

2. **Backend Issues**
   - Check server logs
   - Test endpoints with curl
   - Verify environment variables

3. **Database Issues**
   - Check Supabase dashboard
   - Verify RLS policies
   - Test queries in SQL editor

## 📱 **Access Points**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Supabase Dashboard**: Your Supabase project URL

## 🎉 **Success Indicators**

✅ Frontend loads without errors  
✅ Backend health check passes  
✅ Authentication works  
✅ Database operations succeed  
✅ API integrations function  
✅ All features accessible  

## 🚀 **Deployment**

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

### **Platforms**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase

---

**Your Zesty application is perfectly organized and ready for development!** 🌟 