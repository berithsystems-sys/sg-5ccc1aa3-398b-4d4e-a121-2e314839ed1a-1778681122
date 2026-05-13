# Build & Deploy Instructions

## Local Build Test

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test production build
npm run start
```

## Deploy to Node.js Server (cPanel/VPS)

### Step 1: Set Environment Variables

**Option A: Create .env.local on server**
```bash
nano .env.local
```

Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Option B: Export in terminal (temporary)**
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Option C: Add to ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'tally-prime',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_anon_key_here'
    }
  }]
}
```

### Step 2: Build on Server

```bash
# Navigate to project directory
cd /home/username/public_html

# Install dependencies
npm install --production

# Build the application (with env vars set)
npm run build
```

### Step 3: Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 4: Verify

```bash
# Check if app is running
pm2 status

# View logs
pm2 logs tally-prime

# Test the application
curl http://localhost:3000
```

## Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/tally-prime.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Step 3: Custom Domain (Optional)

1. In Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS in cPanel/Hostinger:
   - Type: CNAME
   - Name: @ or subdomain
   - Value: cname.vercel-dns.com

## Troubleshooting

### Build Error: Missing Supabase variables

**Solution:** Set environment variables before building:

```bash
# Linux/Mac
export NEXT_PUBLIC_SUPABASE_URL=your_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
npm run build

# Windows CMD
set NEXT_PUBLIC_SUPABASE_URL=your_url
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
npm run build

# Windows PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL="your_url"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key"
npm run build
```

### App crashes after deploy

Check logs:
```bash
pm2 logs tally-prime --lines 100
```

Common issues:
- Missing environment variables
- Wrong Node.js version (need 18+)
- Port already in use
- Insufficient memory

### Can't connect to database

1. Verify Supabase URL and key are correct
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check browser console for errors

### Memory issues on shared hosting

Next.js requires ~200-500MB RAM in production. If your shared hosting kills the process:
- Upgrade to VPS
- Use Vercel instead (free tier)
- Contact hosting support

## Quick Reference

```bash
# Install
npm install

# Build
npm run build

# Start (after build)
npm run start

# Start with custom server
npm run start:production

# PM2 commands
pm2 start ecosystem.config.js
pm2 restart tally-prime
pm2 stop tally-prime
pm2 delete tally-prime
pm2 logs tally-prime
pm2 monit

# Check Node version
node --version

# Check environment
echo $NEXT_PUBLIC_SUPABASE_URL
```

## Security Notes

- Never commit `.env.local` to git
- Keep Supabase keys secure
- Use environment variables in deployment
- Enable HTTPS in production
- Regular backups of database