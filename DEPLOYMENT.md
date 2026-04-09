# Deployment Guide - Railway + GitHub Pages

## Backend Deployment - Railway

### Option 1: Deploy via Railway Dashboard (Recommended)

#### Step 1: Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Verify your email

#### Step 2: Create a New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `Amirhj110/customer-support-ticket-system`
4. Railway will auto-detect the `Dockerfile` and `railway.json`

#### Step 3: Configure Environment Variables
1. Go to your project dashboard
2. Click on the service (default name: "customer-support-ticket-system")
3. Click "Variables" tab
4. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SECRET_KEY` | `your-secret-key-here` | Generate with: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` | Disable debug mode in production |
| `ALLOWED_HOSTS` | `your-railway-domain.up.railway.app,localhost,127.0.0.1` | Update after first deploy |
| `PORT` | `8000` | (Railway sets this automatically) |

#### Step 4: Deploy
1. Click "Deploy" (happens automatically on push)
2. Wait for the build to complete
3. Railway will provide you with a URL like: `https://customer-support-ticket-system-production.up.railway.app`

#### Step 5: Run Database Migrations
1. Go to your service in Railway dashboard
2. Click "..." menu → "Shell"
3. Run:
```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Step 6: Collect Static Files
In the same shell:
```bash
python manage.py collectstatic --noinput
```

#### Step 7: Update Frontend URL
1. Copy your Railway backend URL
2. Update `frontend/.env.production`:
```
VITE_API_URL=https://your-railway-domain.up.railway.app
```
3. Commit and push to trigger frontend redeploy

---

### Option 2: Deploy via GitHub Actions

#### Setup Railway Token
1. Go to [railway.app](https://railway.app) → Account Settings → Tokens
2. Create a new token with "Deploy" scope
3. Add it to your GitHub repository secrets as `RAILWAY_TOKEN`
4. Get your Project ID from the Railway dashboard URL and add as `RAILWAY_PROJECT_ID`

#### Configure GitHub Actions
The workflow is already configured at `.github/workflows/deploy-backend.yml`. It will:
1. Trigger on every push to master/main
2. Install Railway CLI
3. Deploy to Railway automatically

---

## Frontend Deployment - GitHub Pages

### Automatic Deployment via GitHub Actions

The repository includes a workflow that deploys the frontend to GitHub Pages automatically.

**Setup Steps:**
1. Go to your GitHub repository → Settings → Pages
2. Under "Build and deployment", select "GitHub Actions"
3. The workflow at `.github/workflows/deploy-frontend.yml` is already configured
4. Push to master/main to trigger deployment

**Note:** Make sure to update `VITE_API_URL` in `frontend/.env.production` to point to your Railway backend before deploying.

---

## Post-Deployment Checklist

### Backend (Railway)
- [ ] Service is deployed and running
- [ ] Health check endpoint works: `https://your-domain.up.railway.app/api/health/`
- [ ] Database migrations applied
- [ ] Superuser created
- [ ] Environment variables configured
- [ ] CORS configured for GitHub Pages domain
- [ ] Static files collected

### Frontend (GitHub Pages)
- [ ] Site accessible at `https://amirhj110.github.io/customer-support-ticket-system`
- [ ] API calls working (check browser network tab)
- [ ] Authentication works
- [ ] Dashboard loads
- [ ] All pages functional

---

## Troubleshooting

### Railway Deployment Issues

**Build Fails:**
1. Check Railway logs in dashboard
2. Verify `Dockerfile` is correct
3. Ensure `requirements.txt` has all dependencies

**Application Won't Start:**
1. Check if `PORT` environment variable is set
2. Verify `railway.json` start command
3. Check gunicorn is working: `gunicorn --bind 0.0.0.0:$PORT support_system.wsgi:application`

**Database Errors:**
1. Run migrations in Railway shell: `python manage.py migrate`
2. Check database file permissions
3. For persistent data, consider Railway's Volume feature

### CORS Errors
If frontend shows CORS errors:
1. Add your GitHub Pages URL to `CORS_ALLOWED_ORIGINS` in Django settings
2. Include Railway preview URLs with regex: `r"^https://.*\.up\.railway\.app$"`
3. Redeploy backend after changes

### Static Files Issues
1. Run `python manage.py collectstatic` in Railway shell
2. Check `STATIC_ROOT` and `STATIC_URL` in settings.py
3. Verify WhiteNoise is configured (if using)

---

## Useful Commands

### Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open shell in service
railway shell

# Deploy manually
railway up
```

### Railway Shell Commands
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static
python manage.py collectstatic --noinput

# Check Django shell
python manage.py shell
```

### Local Development
```bash
# Backend
python manage.py runserver

# Frontend
cd frontend
npm run dev
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Pages                          │
│    https://amirhj110.github.io/customer-support-...     │
│                      (Frontend)                          │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls (HTTPS)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     Railway                              │
│     https://xxx.up.railway.app (Django Backend)       │
│                      (Backend)                           │
│              ┌──────────────────┐                       │
│              │     SQLite DB    │                       │
│              └──────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

**Data Persistence:** By default, SQLite is used. For production with data persistence, consider:
- Railway Volumes for SQLite file persistence
- Or switch to PostgreSQL with Railway's database service
