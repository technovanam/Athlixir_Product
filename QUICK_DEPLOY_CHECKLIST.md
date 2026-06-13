# Quick Deployment Checklist

## ⏱️ Time Estimate: 30-45 minutes

---

## PHASE 1: Create Accounts & Get Tokens (10 min)

### Docker Hub
- [ ] Sign up at [hub.docker.com](https://hub.docker.com)
- [ ] Create Access Token: Settings → Security → New Access Token
  - Name: `github-actions`
  - **SAVE:** `DOCKER_USERNAME` + `DOCKER_PASSWORD`
- [ ] Create Repository: `athlixir-ai-engine` (public or private)

### Render
- [ ] Sign up at [render.com](https://render.com) with GitHub
- [ ] Go to Account → API Tokens
  - Click **Create API Key**
  - **SAVE:** `RENDER_API_TOKEN`

### Vercel
- [ ] Sign up at [vercel.com](https://vercel.com) with GitHub
- [ ] Go to Account → Tokens
  - Click **Create Token**
  - **SAVE:** `VERCEL_TOKEN`
- [ ] Go to Account → General
  - **SAVE:** `VERCEL_ORG_ID`

---

## PHASE 2: Deploy to Render - Server (10 min)

### Create Service
- [ ] Render Dashboard → New+ → Web Service
- [ ] Select your GitHub repo
- [ ] Configure:
  ```
  Name: athlixir-backend
  Root Directory: server
  Runtime: Node
  Build Command: pnpm install && pnpm build
  Start Command: pnpm start:prod
  ```
- [ ] Create Service
- [ ] Wait for deployment (3-5 min)
- [ ] **SAVE:** Service ID from Settings

### Add Environment Variables
Go to Service → Settings → Environment Variables and add:

```
NODE_ENV=production
PORT=3001
FASTAPI_URL=(get AI Engine URL later)
FASTAPI_INTEL_URL=(get AI Engine URL later)
FASTAPI_PUBLIC_URL=(get AI Engine URL later)
FIREBASE_PROJECT_ID=your-value
FIREBASE_CLIENT_EMAIL=your-value
FIREBASE_PRIVATE_KEY=your-value
FIREBASE_STORAGE_BUCKET=your-value
FIREBASE_WEB_API_KEY=your-value
GEMINI_API_KEY=your-value
CLAUDE_API_KEY=your-value
INTERNAL_API_SECRET=your-value
REDIS_HOST=your-redis-host (if using Redis)
REDIS_PORT=6379
```

### Test Health
- [ ] Server URL: `https://athlixir-backend.onrender.com`
- [ ] Test: `curl https://athlixir-backend.onrender.com/api/health`
- [ ] Expected: `{"status":"OK",...}`

---

## PHASE 3: Deploy to Render - AI Engine (15 min)

### Create Service
- [ ] Render Dashboard → New+ → Web Service
- [ ] Select your GitHub repo
- [ ] Configure:
  ```
  Name: athlixir-ai-engine
  Root Directory: ai-engine
  Runtime: Docker
  Dockerfile Path: ./Dockerfile
  ```
- [ ] Create Service
- [ ] Wait for Docker build (5-10 min)
- [ ] **SAVE:** Service ID from Settings

### Add Environment Variables
Go to Service → Settings → Environment Variables and add:

```
PORT=8080
HOST=0.0.0.0
PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
INTERNAL_API_SECRET=your-value
REDIS_HOST=your-redis-host (if using Redis)
REDIS_PORT=6379
```

### Update Server Environment Variables
Go back to Server service and add:
```
FASTAPI_URL=https://athlixir-ai-engine.onrender.com/api/analyze
FASTAPI_INTEL_URL=https://athlixir-ai-engine.onrender.com/api/analyze/intelligence
FASTAPI_PUBLIC_URL=https://athlixir-ai-engine.onrender.com
```

### Test Health
- [ ] AI Engine URL: `https://athlixir-ai-engine.onrender.com`
- [ ] Test: `curl https://athlixir-ai-engine.onrender.com/health`
- [ ] Expected: `{"status":"healthy",...}`

---

## PHASE 4: Deploy to Vercel - Client (5 min)

### Create Project
- [ ] Vercel Dashboard → New Project
- [ ] Select your GitHub repo
- [ ] Configure:
  ```
  Framework: Next.js
  Root Directory: ./client
  Build Command: pnpm build
  Output Directory: .next
  ```
- [ ] Click Deploy
- [ ] Wait for build (2-3 min)
- [ ] **SAVE:** Project ID from Settings

### Add Environment Variables
Go to Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://athlixir-backend.onrender.com
```

### Test
- [ ] Client URL: Vercel provides this (e.g., `athlixir.vercel.app`)
- [ ] Open in browser
- [ ] Should load without errors

---

## PHASE 5: Add GitHub Secrets (5 min)

Go to GitHub Repo → Settings → Secrets and variables → Actions

### Add Each Secret

```
1. VERCEL_TOKEN = (from Vercel step)
2. VERCEL_ORG_ID = (from Vercel step)
3. VERCEL_CLIENT_PROJECT_ID = (from Vercel step)
4. NEXT_PUBLIC_API_URL = https://athlixir-backend.onrender.com
5. RENDER_API_TOKEN = (from Render step)
6. RENDER_SERVER_SERVICE_ID = (from Render Server)
7. RENDER_AI_ENGINE_SERVICE_ID = (from Render AI Engine)
8. FIREBASE_PROJECT_ID = (from Firebase)
9. FIREBASE_CLIENT_EMAIL = (from Firebase)
10. FIREBASE_PRIVATE_KEY = (from Firebase - with \n)
11. FIREBASE_STORAGE_BUCKET = (from Firebase)
12. FIREBASE_WEB_API_KEY = (from Firebase)
13. GEMINI_API_KEY = (from Google)
14. CLAUDE_API_KEY = (from Anthropic)
15. INTERNAL_API_SECRET = (generate: openssl rand -hex 32)
16. DOCKER_USERNAME = (from Docker Hub)
17. DOCKER_PASSWORD = (from Docker Hub - token, not password!)
```

### Checklist
- [ ] All 17 secrets added
- [ ] No typos in names
- [ ] Values copied correctly
- [ ] Private keys have quotes and \n preserved

---

## PHASE 6: Trigger First Deployment (automatic)

### Option A: Via GitHub Actions
- [ ] Go to GitHub repo
- [ ] Make a small change to `client/` folder
- [ ] Commit and push to main
- [ ] Go to Actions tab
- [ ] Watch workflows run:
  - `client-deploy.yml` ✓
  - (server-deploy.yml and ai-engine-deploy.yml run only if those folders changed)
- [ ] Wait for deployment (~5-10 min)

### Option B: Manual Trigger
- [ ] Go to GitHub Actions
- [ ] Select workflow
- [ ] Click Run workflow
- [ ] Wait for completion

---

## PHASE 7: Verify Everything Works (5 min)

### Test Client
- [ ] Open Vercel URL in browser
- [ ] Page should load
- [ ] Check Network tab
- [ ] Should see API calls to Render server

### Test Server
- [ ] `curl https://athlixir-backend.onrender.com/api/health`
- [ ] Should return: `{"status":"OK"}`

### Test AI Engine
- [ ] `curl https://athlixir-ai-engine.onrender.com/health`
- [ ] Should return: `{"status":"healthy"}`

### Test Full Flow
- [ ] Login in client
- [ ] Upload video (if applicable)
- [ ] Check Network tab - calls should go to Render API

---

## POST-DEPLOYMENT

### Monitor Deployments
- [ ] GitHub Actions: All workflows show ✓
- [ ] Vercel Dashboard: Latest deployment shows "Ready"
- [ ] Render Dashboard: Both services show "Live"

### Check Logs for Errors
- [ ] Vercel: Deployments → Latest → Runtime Logs
- [ ] Render Server: Service → Logs
- [ ] Render AI Engine: Service → Logs

### Update Code & Redeploy
After making changes:
```bash
git add .
git commit -m "your message"
git push origin main
```
→ GitHub Actions automatically redeploys (if tests pass)

---

## BACKUP: Manual Commands (if automated fails)

### Build Locally
```bash
# Client
cd client && pnpm build

# Server
cd server && pnpm build

# AI Engine
cd ai-engine && docker build -t athlixir-ai-engine:latest .
```

### Push Docker Image
```bash
docker login  # use your Docker Hub username
docker tag athlixir-ai-engine:latest YOUR_USERNAME/athlixir-ai-engine:latest
docker push YOUR_USERNAME/athlixir-ai-engine:latest
```

### Redeploy via Render
- [ ] Go to service
- [ ] Click "Redeploy" button
- [ ] Wait for new deployment

---

## ✅ FINAL CHECKLIST

**Accounts & Tokens:**
- [ ] Docker Hub account + token
- [ ] Render account + API token
- [ ] Vercel account + token
- [ ] Firebase project setup
- [ ] All API keys obtained

**Render Services:**
- [ ] Server service created & running
- [ ] AI Engine service created & running
- [ ] Health checks passing
- [ ] Environment variables set

**Vercel Project:**
- [ ] Client project created
- [ ] Environment variables set
- [ ] Auto-deployments enabled

**GitHub:**
- [ ] All 17 secrets added
- [ ] Workflows present in .github/workflows/
- [ ] First test deployment successful

**Verification:**
- [ ] Client loads in browser
- [ ] Server API responds
- [ ] AI Engine responds
- [ ] Data flows between services

---

## 🎉 DONE!

Your deployment is complete. The CI/CD pipeline will now:
1. Run tests on every push
2. Only deploy if tests pass
3. Automatically update all 3 services

**Deployment Status URLs:**
- Client: https://athlixir.vercel.app
- Server: https://athlixir-backend.onrender.com
- AI Engine: https://athlixir-ai-engine.onrender.com

