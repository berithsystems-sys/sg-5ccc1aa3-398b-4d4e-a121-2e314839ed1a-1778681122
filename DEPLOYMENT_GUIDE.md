# Deploy Next.js Tally Prime Clone to cPanel (Hostinger)

## Prerequisites
- Hostinger hosting with Node.js support (Business or higher plan)
- SSH/Terminal access or cPanel File Manager
- Node.js 18+ installed on the server

## ⚠️ CRITICAL: Environment Variables

Your `.env.local` file is NOT included in git (it's in `.gitignore` for security). You MUST set environment variables in your deployment platform.

### Required Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Where to Set Environment Variables:

**1. GitHub Actions (if using CI/CD):**
- Go to your GitHub repository
- Settings → Secrets and variables → Actions
- Add secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**2. Vercel:**
- Project Settings → Environment Variables
- Add both variables

**3. cPanel Node.js App:**
- In cPanel → Setup Node.js App
- Click on your app
- Add environment variables in the interface

**4. Manual Deployment (SSH):**
Create `.env.local` file on server:
```bash
cd /home/username/public_html
nano .env.local
```

Add:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Save and restart the app.

**5. Using export in SSH:**
```bash
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
npm run build
```

## ⚠️ Important Limitations
Next.js requires a **persistent Node.js server**. Most shared cPanel hosting:
- Has resource limits (RAM, CPU)
- May not support long-running Node.js processes
- Better suited for static sites or PHP

**Recommended Alternative:** Use Vercel (free) for better Next.js hosting.

## Deployment Steps

### Option 1: cPanel Node.js Application Manager (Recommended)

#### Step 1: Prepare Your Application Locally
```bash
# Build the production bundle
npm run build:cpanel

# This creates a 'cpanel-build' folder with standalone output
```

#### Step 2: Upload to cPanel
1. Log into cPanel
2. Open **File Manager**
3. Navigate to your domain directory (e.g., `/home/username/public_html`)
4. Upload these files from `cpanel-build` folder:
   - `.next/` folder (entire folder)
   - `public/` folder
   - `node_modules/` folder (or install on server)
   - `package.json`
   - `server.js`
   - `.htaccess`

#### Step 3: Configure Node.js Application in cPanel
1. In cPanel, find **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `/home/username/public_html`
   - **Application URL:** yourdomain.com
   - **Application startup file:** `server.js`
   - **Port:** 3000 (or port cPanel assigns)

4. Click **Create**

#### Step 4: Install Dependencies
1. In the Node.js application details, click **Run NPM Install**
2. Or use Terminal:
```bash
cd /home/username/public_html
npm install --production
```

#### Step 5: Set Environment Variables
In cPanel Node.js App interface, add:
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### Step 6: Start the Application
1. Click **Start App** in cPanel Node.js interface
2. Or use PM2 via SSH:
```bash
pm2 start server.js --name "tally-prime"
pm2 save
pm2 startup
```

#### Step 7: Configure Domain
1. Update `.htaccess` in your domain root:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

2. Restart Node.js app

### Option 2: Manual PM2 Deployment (Via SSH)

#### Requirements
- SSH access to cPanel
- Node.js and PM2 installed

#### Steps:
```bash
# 1. Connect via SSH
ssh your_username@your_domain.com

# 2. Navigate to your web directory
cd ~/public_html

# 3. Clone or upload your project
# (Use FTP or git clone if you have a repository)

# 4. Install dependencies
npm install --production

# 5. Build the application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Check status
pm2 status
pm2 logs
```

### Option 3: Static Export (Limited Features)

⚠️ **This removes all server-side features** (API routes, SSR, authentication)

```bash
# 1. Update next.config.mjs
output: 'export'

# 2. Build static site
npm run build

# 3. Upload 'out' folder contents to public_html

# 4. Configure Supabase for client-only auth
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs tally-prime

# Check Node.js app status in cPanel
# Verify port isn't already in use
netstat -tuln | grep 3000
```

### Permission Errors
```bash
# Fix file permissions
chmod -R 755 /home/username/public_html
chown -R username:username /home/username/public_html
```

### Environment Variables Not Loading
1. Check `.env.local` file exists
2. Verify variables in cPanel Node.js app settings
3. Restart the application after changes

### High Memory Usage
- Next.js in production uses ~200-500MB RAM
- Shared hosting may kill the process
- Consider upgrading to VPS or using Vercel

## Recommended: Deploy to Vercel Instead

For better Next.js performance:

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/tally-prime.git
git push -u origin main
```

2. **Deploy on Vercel:**
- Visit [vercel.com](https://vercel.com)
- Import GitHub repository
- Add Supabase environment variables
- Deploy (automatic)

3. **Point your domain to Vercel:**
- In Vercel: Add custom domain
- In cPanel/Hostinger DNS: Add CNAME record pointing to Vercel

**Advantages:**
- Automatic scaling
- Better performance
- Zero configuration
- Free tier available
- Automatic HTTPS
- Global CDN

## Post-Deployment Checklist

- [ ] Application starts successfully
- [ ] Environment variables loaded
- [ ] Database connection working
- [ ] Authentication flows working
- [ ] All pages accessible
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] PM2 process running
- [ ] Domain pointing correctly
- [ ] Backup strategy in place

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check cPanel error logs
3. Verify Node.js version: `node --version`
4. Test locally first: `npm run build && npm run start:production`

## Notes

- Hostinger's shared hosting may have limitations
- Consider VPS hosting for production use
- Monitor resource usage (RAM, CPU)
- Set up automatic backups
- Use Vercel for better Next.js support