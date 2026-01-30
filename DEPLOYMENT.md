# 🚀 Storyteller Deployment Guide

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/)
- [Vercel CLI](https://vercel.com/cli) (for deployment)
- [xAI API Key](https://console.x.ai/)

## 🔧 Local Development Setup

### 1. Install Dependencies
```bash
cd /data/clawdbot/workspace/storyteller
npm ci
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE storyteller_dev;
CREATE USER storyteller_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE storyteller_dev TO storyteller_user;
\q
```

#### Option B: Hosted PostgreSQL (Recommended for Production)
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com/database
- **Railway**: https://railway.app/
- **Neon**: https://neon.tech/

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL: Your PostgreSQL connection string
# - XAI_API_KEY: Your xAI API key from console.x.ai
```

### 4. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to test the application.

## 🌐 Production Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Configure Production Database

#### Option A: Vercel Postgres (Recommended)
```bash
# Create Postgres database in Vercel dashboard or CLI
vercel env add DATABASE_URL
# Enter your production PostgreSQL URL when prompted
```

#### Option B: External Provider
Set up your preferred PostgreSQL provider and note the connection string.

### 4. Set Environment Variables in Vercel
```bash
# xAI API Key
vercel env add XAI_API_KEY
# Enter your xAI API key when prompted

# Database URL (if not using Vercel Postgres)
vercel env add DATABASE_URL
# Enter your production database URL when prompted
```

### 5. Deploy to Vercel
```bash
# Initial deployment
vercel --prod

# Subsequent deployments
vercel --prod
```

### 6. Domain Configuration for emmett.wtf

#### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Domains" 
3. Add "emmett.wtf" as a custom domain
4. Follow Vercel's DNS configuration instructions

#### DNS Configuration:
Add these records to your DNS provider:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 🧪 Testing the Complete Flow

### 1. Health Check
```bash
curl https://emmett.wtf/api/stories
# Should return: {"error":"Method not allowed"} (GET not supported, but endpoint exists)
```

### 2. Create a Story
```javascript
// Using browser console or Postman
fetch('https://emmett.wtf/api/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Adventure',
    premise: 'A brave knight sets out on a quest to save the kingdom from an ancient evil.'
  })
})
.then(r => r.json())
.then(console.log);
```

### 3. Generate First Scene
```javascript
// Use story ID from previous response
fetch('https://emmett.wtf/api/stories/[STORY_ID]/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    choiceText: null, // null for opening scene
    parentSceneId: null
  })
})
.then(r => r.json())
.then(console.log);
```

### 4. Test Character Updates
After generating scenes, check for proposed character changes:
```javascript
// The generate response should include proposedChanges array
// Test accepting/rejecting changes in the UI
```

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db execute --command "SELECT 1"

# Reset database (WARNING: destroys data)
npx prisma migrate reset
```

#### xAI API Issues
- Verify API key is correct: https://console.x.ai/
- Check API quotas and billing
- Test with a simple curl request:
```bash
curl -X POST "https://api.x.ai/v1/chat/completions" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-3-latest",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

### Monitoring & Logs
- **Vercel Logs**: `vercel logs --follow`
- **Database Logs**: Check your PostgreSQL provider dashboard
- **Application Logs**: Available in Vercel dashboard

## 🎯 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance (run in your database)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenes_story_parent ON "Scene" ("storyId", "parentSceneId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposed_changes_scene_status ON "ProposedChange" ("sceneId", "status");
```

### Vercel Configuration
- Use Vercel's Edge Runtime for faster response times
- Configure proper caching headers
- Monitor function execution time (current limit: 30 seconds)

## 📈 Monitoring Setup

### Key Metrics to Track
- Story creation rate
- Scene generation success rate  
- Character update acceptance rate
- API response times
- Database query performance

### Health Checks
Set up monitoring for:
- `/api/stories` endpoint availability
- Database connectivity
- xAI API connectivity and quota

## 🔒 Security Considerations

- Environment variables are properly configured
- Database credentials are secure
- API keys are not exposed in client-side code
- Rate limiting may be needed for production use

## 📱 Mobile Testing

Test on various devices and screen sizes:
- Responsive design verification
- Touch interaction testing
- Performance on mobile networks