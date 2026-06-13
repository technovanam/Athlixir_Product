# CI/CD Pipeline Setup Guide

## Overview

This document explains the complete CI/CD pipeline setup for Athlixir:
- **Client**: Deployed to Vercel
- **Server**: Deployed to Render
- **AI Engine**: Deployed to Render

All deployments are automatic on push to main, but only if all tests pass.

---

## 🔑 Required Secrets for GitHub Actions

### For Client (Vercel Deployment)

Add these secrets to your GitHub repository:

```
VERCEL_TOKEN              - Your Vercel API token
VERCEL_ORG_ID             - Your Vercel organization ID
VERCEL_CLIENT_PROJECT_ID  - Your Vercel project ID for client
NEXT_PUBLIC_API_URL       - Backend API URL (e.g., https://api.athlixir.com)
```

**How to get these:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Go to Vercel project settings to find org ID and project ID

### For Server (Render Deployment)

```
RENDER_SERVER_SERVICE_ID  - Your Render service ID for backend
RENDER_API_TOKEN          - Your Render API token
FIREBASE_PROJECT_ID       - Firebase project ID
FIREBASE_CLIENT_EMAIL     - Firebase client email
FIREBASE_PRIVATE_KEY      - Firebase private key
INTERNAL_API_SECRET       - Secret for internal API communication
```

**How to get these:**
1. Go to [render.com/account/api-tokens](https://render.com/account/api-tokens)
2. Create a new API key
3. Get service IDs from your Render services

### For AI Engine (Render Deployment)

```
RENDER_AI_ENGINE_SERVICE_ID - Your Render service ID for AI engine
RENDER_API_TOKEN            - Your Render API token (same as above)
DOCKER_USERNAME             - Docker Hub username
DOCKER_PASSWORD             - Docker Hub access token
INTERNAL_API_SECRET         - Secret for internal API communication
```

---

## 📋 Setting Up Secrets in GitHub

1. Go to your repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the lists above

---

## 🚀 Deployment Workflow

### Step 1: Client Deployment (Vercel)

**File:** `.github/workflows/client-deploy.yml`

**Trigger:** Any push to `main` that modifies files in `client/` directory

**Steps:**
1. ✅ Install dependencies (`pnpm install`)
2. ✅ Build Next.js project (`pnpm build`)
3. ✅ Run linter (`pnpm lint`)
4. ✅ Install Playwright browsers
5. ✅ Run E2E tests (`pnpm test:e2e`)
6. 🚀 Deploy to Vercel (only if tests pass)

**Tests Included:**
- `client/e2e/auth.spec.ts` - Authentication flows
- `client/e2e/production-validation.spec.ts` - Core functionality
- `client/e2e/responsiveness.spec.ts` - Responsive design

---

### Step 2: Server Deployment (Render)

**File:** `.github/workflows/server-deploy.yml`

**Trigger:** Any push to `main` that modifies files in `server/` directory

**Steps:**
1. ✅ Install dependencies (`pnpm install`)
2. ✅ Run linter (`pnpm lint`)
3. ✅ Build project (`pnpm build`)
4. ✅ Run unit tests (`pnpm test`)
5. ✅ Run E2E tests (`pnpm test:e2e`)
6. ✅ Generate coverage report (`pnpm test:cov`)
7. 🚀 Deploy to Render (only if all tests pass)

**Tests Included:**
- `server/test/app.e2e-spec.ts` - API endpoints
- `server/test/auth.e2e-spec.ts` - Authentication
- `server/test/production-validation.e2e-spec.ts` - Production scenarios
- Unit tests with Jest

**Services Available During Tests:**
- Redis (for caching/queues)
- Firebase (for database/auth)

---

### Step 3: AI Engine Deployment (Render)

**File:** `.github/workflows/ai-engine-deploy.yml`

**Trigger:** Any push to `main` that modifies files in `ai-engine/` directory

**Steps:**
1. ✅ Install Python dependencies
2. ✅ Run E2E tests (`scripts/test_pipeline_e2e.py`)
3. ✅ Run determinism validation (`scripts/validate_determinism.py`)
4. ✅ Lint Python code (pylint)
5. 🐳 Build Docker image
6. 🚀 Push to Docker Hub
7. 🚀 Deploy to Render (only if all tests pass)

**Tests Included:**
- `ai-engine/scripts/test_pipeline_e2e.py` - Pipeline functionality
- `ai-engine/scripts/validate_determinism.py` - Output consistency

**System Dependencies:**
- Python 3.10
- OpenCV (libgl1, libglib2.0-0, libgomp1)
- MediaPipe
- FastAPI

---

## 📊 Test Coverage

### Client Tests
```
✅ Authentication flows (login, signup, logout)
✅ Form validation
✅ API integration
✅ Responsive design (mobile, tablet, desktop)
✅ Video upload
✅ Dashboard functionality
```

### Server Tests
```
✅ API routes
✅ Authentication & authorization
✅ Database operations
✅ Error handling
✅ Validation
✅ WebSocket communication
```

### AI Engine Tests
```
✅ Biomechanics pipeline
✅ Video processing
✅ Pose detection
✅ Metrics calculation
✅ Output consistency (determinism)
✅ Performance benchmarks
```

---

## 🔄 GitHub Actions Status

Monitor your deployments:

1. Go to your GitHub repository
2. Click **Actions** tab
3. View workflow runs for:
   - `client-deploy.yml`
   - `server-deploy.yml`
   - `ai-engine-deploy.yml`

Each workflow shows:
- ✅ Build status
- ✅ Test results
- ✅ Deployment status

---

## 🛠️ Manual Deployment (if needed)

### Deploy Client Manually
```bash
cd client
vercel --prod
```

### Deploy Server Manually
```bash
cd server
npm run build
# Push Docker image
docker build -t myregistry/server:latest .
docker push myregistry/server:latest
# Then trigger Render deploy via API or dashboard
```

### Deploy AI Engine Manually
```bash
cd ai-engine
docker build -t myregistry/ai-engine:latest .
docker push myregistry/ai-engine:latest
# Then trigger Render deploy via API or dashboard
```

---

## 🔗 Environment Variables by Service

### Client (.env.local in Vercel)
```
NEXT_PUBLIC_API_URL=https://api.athlixir.com
```

### Server (.env in Render)
```
NODE_ENV=production
PORT=3001
FASTAPI_URL=https://ai-engine.athlixir.com/api/analyze
FASTAPI_INTEL_URL=https://ai-engine.athlixir.com/api/analyze/intelligence
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
FIREBASE_WEB_API_KEY=your-api-key
GEMINI_API_KEY=your-gemini-key
CLAUDE_API_KEY=your-claude-key
INTERNAL_API_SECRET=your-secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### AI Engine (.env in Render)
```
PORT=8080
HOST=0.0.0.0
PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
INTERNAL_API_SECRET=your-secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

---

## ✅ Deployment Checklist

- [ ] Create GitHub secrets for all services
- [ ] Create Vercel account and project
- [ ] Create Render account and services
- [ ] Set up environment variables in each platform
- [ ] Test locally with `docker-compose up`
- [ ] Push to main branch
- [ ] Monitor GitHub Actions workflow
- [ ] Check deployment logs in Vercel/Render dashboards

---

## 🚨 Troubleshooting

### Tests Failing?
1. Run tests locally: `npm test` (server/client) or `python scripts/test_pipeline_e2e.py` (ai-engine)
2. Fix failing tests before pushing to main
3. Check GitHub Actions logs for detailed error messages

### Deployment Failing?
1. Check environment variables are set correctly
2. Verify API tokens and service IDs
3. Check application logs in Render/Vercel dashboards
4. Ensure all dependencies are properly installed

### Slow Deployments?
1. Cache is being used (PNPM/pip caching)
2. Playwright/system dependencies installation takes time
3. Docker image building and pushing can be slow

---

## 📈 Monitoring

### GitHub Actions Dashboard
- View all workflow runs
- Check test coverage
- Monitor deployment history

### Vercel Dashboard
- View client deployments
- Check build logs
- Monitor performance

### Render Dashboard
- View server and AI engine deployments
- Check application logs
- Monitor resource usage

---

## 🔐 Security Best Practices

1. ✅ All secrets stored in GitHub (not in code)
2. ✅ API tokens rotated regularly
3. ✅ Sensitive data encrypted
4. ✅ Tests run before deployment (prevents broken code)
5. ✅ Docker images scanned for vulnerabilities

---

## 📞 Support

For issues:
1. Check GitHub Actions logs
2. Review Render/Vercel deployment logs
3. Run tests locally to reproduce issues
4. Check environment variable configuration

