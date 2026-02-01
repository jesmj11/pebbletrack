# Railway Environment Variables

## Required Environment Variables:

### Database (if using PostgreSQL):
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### Optional (for AI features):
```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### Production Settings:
```
NODE_ENV=production
PORT=5000
```

## Railway Setup Steps:

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose: jesmj11/pebbletrack
4. Railway auto-detects Node.js and deploys
5. Add environment variables in Railway dashboard
6. Your app will be live at: https://your-app-name.railway.app

## Database Options:

### Option A: Railway PostgreSQL (Recommended)
- Click "Add PostgreSQL" in Railway dashboard
- DATABASE_URL is automatically set

### Option B: Keep using localStorage (for quick demo)
- No database setup needed
- Works immediately
- Perfect for testing with families

## Quick Test:
- https://your-app.railway.app/static-student.html
- https://your-app.railway.app/static-parent.html