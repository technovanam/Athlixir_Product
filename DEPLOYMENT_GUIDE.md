# Complete Deployment Guide - Vercel & Render

**Project:** Athlixir  
**Date:** June 13, 2026  
**Platforms:** Vercel (Client) | Render (Server & AI Engine)

---

## 📋 TABLE OF CONTENTS

1. [Docker Hub Setup](#1-docker-hub-setup)
2. [Server Deployment (Render)](#2-server-deployment-render)
3. [AI Engine Deployment (Render)](#3-ai-engine-deployment-render)
4. [Client Deployment (Vercel)](#4-client-deployment-vercel)
5. [GitHub Secrets Setup](#5-github-secrets-setup)
6. [Post-Deployment Verification](#6-post-deployment-verification)

---

# 1. DOCKER HUB SETUP

## Purpose
Docker Hub stores your Docker images. Both Server and AI Engine need Docker images for Render deployment.

## Step-by-Step Setup

### 1.1 Create Docker Hub Account
1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **Sign Up**
3. Fill in username, email, password
4. Verify your email
5. Log in

### 1.2 Create Access Token (for GitHub Actions)
1. Go to [Account Settings → Security](https://hub.docker.com/settings/security)
2. Click **New Access Token**
3. Name it: `github-actions`
4. Click **Generate**
5. **COPY** the token (you won't see it again!)
6. Save it somewhere safe

### 1.3 Create Repository for AI Engine
1. Click **Create** → **Create repository**
2. Name: `athlixir-ai-engine`
3. Description: "Athlixir AI Biomechanics Engine"
4. Visibility: **Public** (for simplicity) or **Private**
5. Click **Create**

**Result:**
- Repository URL: `docker.io/YOUR_USERNAME/athlixir-ai-engine`
- Example: `docker.io/johndoe/athlixir-ai-engine`

### 1.4 Docker Hub Credentials for GitHub
You'll need:
```
DOCKER_USERNAME = your_docker_username
DOCKER_PASSWORD = your_access_token (NOT your password!)
```

---

# 2. SERVER DEPLOYMENT (RENDER)

## Service Details
- **Service Name:** athlixir-backend
- **Runtime:** Node.js
- **Root Directory:** `server/`
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start:prod`
- **Port:** 3001

## Step-by-Step Setup

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize GitHub access
4. Skip the onboarding

### 2.2 Create Web Service for Server
1. Click **New+** → **Web Service**
2. Select your GitHub repository
3. Configure:
   - **Name:** `athlixir-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start:prod`
   - **Environment:** `production`
   - **Plan:** Free or Paid (recommended: Starter)

### 2.3 Create Render Service ID
After creating the service:
1. Go to your service dashboard
2. Click **Settings**
3. Copy the **Service ID** (looks like: `srv-abc123def456`)
4. Save this as `RENDER_SERVER_SERVICE_ID`

### 2.4 Create Render API Token
1. Go to [Account Settings → API Tokens](https://dashboard.render.com/account/api-tokens)
2. Click **Create API Key**
3. Name: `github-actions`
4. **COPY** the token
5. Save as `RENDER_API_TOKEN`

### 2.5 Environment Variables in Render

Add these to your Render service (Settings → Environment):

```
NODE_ENV=production
PORT=3001
FASTAPI_URL=https://YOUR_AI_ENGINE_URL.onrender.com/api/analyze
FASTAPI_INTEL_URL=https://YOUR_AI_ENGINE_URL.onrender.com/api/analyze/intelligence
FASTAPI_PUBLIC_URL=https://YOUR_AI_ENGINE_URL.onrender.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
FIREBASE_WEB_API_KEY=AIzaSyB8...
GEMINI_API_KEY=your-gemini-api-key
CLAUDE_API_KEY=your-claude-api-key
INTERNAL_API_SECRET=your-internal-secret
REDIS_HOST=redis.your-redis-provider.com
REDIS_PORT=6379
```

### 2.6 Verify Server Deployment

After deployment:
1. Get your Render URL (shown in dashboard)
2. Test health endpoint:
```bash
curl https://athlixir-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-06-13T12:00:00Z"
}
```

---

# 3. AI ENGINE DEPLOYMENT (RENDER)

## Service Details
- **Service Name:** athlixir-ai-engine
- **Runtime:** Docker
- **Root Directory:** `ai-engine/`
- **Dockerfile:** `ai-engine/Dockerfile`
- **Port:** 8080
- **Build Time:** ~5-10 minutes

## Step-by-Step Setup

### 3.1 Create Docker Web Service for AI Engine
1. Click **New+** → **Web Service**
2. Select your GitHub repository
3. Configure:
   - **Name:** `athlixir-ai-engine`
   - **Root Directory:** `ai-engine`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Environment:** `production`
   - **Plan:** Free or Paid (recommended: Starter)

### 3.2 Create Render Service ID
After creating the service:
1. Go to your service dashboard
2. Click **Settings**
3. Copy the **Service ID**
4. Save as `RENDER_AI_ENGINE_SERVICE_ID`

### 3.3 Environment Variables in Render

Add these to your Render service (Settings → Environment):

```
PORT=8080
HOST=0.0.0.0
PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
INTERNAL_API_SECRET=your-internal-secret
REDIS_HOST=redis.your-redis-provider.com
REDIS_PORT=6379
```

### 3.4 Docker Build Details

**Dockerfile Location:** `ai-engine/Dockerfile`

**Build Process:**
1. Install Python 3.10
2. Install system dependencies (OpenCV, MediaPipe)
3. Install Python packages from `requirements.txt`
4. Copy application code
5. Expose port 8080
6. Run `./start.sh`

**Build Command (for local testing):**
```bash
cd ai-engine
docker build -t athlixir-ai-engine:latest .
```

**Run Locally:**
```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e INTERNAL_API_SECRET=test-secret \
  athlixir-ai-engine:latest
```

### 3.5 Test AI Engine Health Check

After deployment:
```bash
curl https://athlixir-ai-engine.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "athlixir-ai-engine"
}
```

---

# 4. CLIENT DEPLOYMENT (VERCEL)

## Service Details
- **Service Name:** athlixir-client
- **Runtime:** Node.js (Next.js 14)
- **Root Directory:** `client/`
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Framework:** Next.js 14
- **Port:** 3000 (Vercel handles this)

## Step-by-Step Setup

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize GitHub access
4. Link your repository

### 4.2 Create Vercel Project
1. Click **New Project**
2. Select your GitHub repository
3. Framework Preset: **Next.js**
4. Root Directory: `./client`
5. Build Command: `pnpm build`
6. Output Directory: `.next`
7. Click **Deploy**

### 4.3 Get Vercel Project ID
After project creation:
1. Go to Project Settings
2. Copy **Project ID**
3. Save as `VERCEL_CLIENT_PROJECT_ID`

### 4.4 Get Vercel Token
1. Go to [Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: `github-actions`
4. Scope: Select your team
5. **COPY** the token
6. Save as `VERCEL_TOKEN`

### 4.5 Get Vercel Organization ID
1. Go to [Account Settings → General](https://vercel.com/account)
2. Find **Team ID** or **User ID**
3. Save as `VERCEL_ORG_ID`

### 4.6 Environment Variables in Vercel

Add these to Vercel (Settings → Environment Variables):

**For Preview Deployments:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For Production:**
```
NEXT_PUBLIC_API_URL=https://athlixir-backend.onrender.com
```

### 4.7 Verify Client Deployment

After deployment:
1. Vercel provides a URL (e.g., `athlixir.vercel.app`)
2. Click the link to test the application
3. Check Network tab to verify API calls work

---

# 5. GITHUB SECRETS SETUP

## All Required Secrets (Add to GitHub)

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

### 5.1 Vercel Secrets (for Client)

```
VERCEL_TOKEN
  Value: (your vercel token from step 4.4)
  
VERCEL_ORG_ID
  Value: (your org/team ID from step 4.5)
  
VERCEL_CLIENT_PROJECT_ID
  Value: (your project ID from step 4.3)
  
NEXT_PUBLIC_API_URL
  Value: https://athlixir-backend.onrender.com
```

### 5.2 Render Secrets (for Server & AI Engine)

```
RENDER_API_TOKEN
  Value: (your render API token from step 2.4)
  
RENDER_SERVER_SERVICE_ID
  Value: (your server service ID from step 2.3)
  
RENDER_AI_ENGINE_SERVICE_ID
  Value: (your AI engine service ID from step 3.2)
```

### 5.3 Firebase Secrets

Get these from Firebase Console → Project Settings → Service Accounts

```
FIREBASE_PROJECT_ID
  Value: your-firebase-project-id
  
FIREBASE_CLIENT_EMAIL
  Value: firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
  
FIREBASE_PRIVATE_KEY
  Value: "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
  Note: Include the \n characters exactly as shown
  
FIREBASE_STORAGE_BUCKET
  Value: your-bucket.firebasestorage.app
  
FIREBASE_WEB_API_KEY
  Value: AIzaSyB8JmWS7ahZR-N661hCaz8NqTI4z_o9qkE
```

### 5.4 API Key Secrets

```
GEMINI_API_KEY
  Value: (from https://makersuite.google.com/app/apikey)
  
CLAUDE_API_KEY
  Value: (from https://console.anthropic.com/account/api-keys)
```

### 5.5 Internal Secrets

```
INTERNAL_API_SECRET
  Value: (generate with: openssl rand -hex 32)
  
DOCKER_USERNAME
  Value: (your docker hub username from step 1.2)
  
DOCKER_PASSWORD
  Value: (your docker hub access token from step 1.2)
```

## ✅ Complete Secrets Checklist

```
[ ] VERCEL_TOKEN
[ ] VERCEL_ORG_ID
[ ] VERCEL_CLIENT_PROJECT_ID
[ ] NEXT_PUBLIC_API_URL
[ ] RENDER_API_TOKEN
[ ] RENDER_SERVER_SERVICE_ID
[ ] RENDER_AI_ENGINE_SERVICE_ID
[ ] FIREBASE_PROJECT_ID
[ ] FIREBASE_CLIENT_EMAIL
[ ] FIREBASE_PRIVATE_KEY
[ ] FIREBASE_STORAGE_BUCKET
[ ] FIREBASE_WEB_API_KEY
[ ] GEMINI_API_KEY
[ ] CLAUDE_API_KEY
[ ] INTERNAL_API_SECRET
[ ] DOCKER_USERNAME
[ ] DOCKER_PASSWORD
```

---

# 6. POST-DEPLOYMENT VERIFICATION

## Step-by-Step Verification

### 6.1 Check GitHub Actions

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see 3 workflows:
   - `client-deploy.yml`
   - `server-deploy.yml`
   - `ai-engine-deploy.yml`

4. Check the latest run:
   - ✅ All tests passed
   - ✅ All deployments succeeded

### 6.2 Verify Client (Vercel)

**URL Format:**
```
https://athlixir.vercel.app
or
https://YOUR_CUSTOM_DOMAIN
```

**Tests:**
1. Open in browser
2. Check page loads
3. Open DevTools → Network tab
4. Try login/signup
5. Verify API calls to backend

### 6.3 Verify Server (Render)

**URL Format:**
```
https://athlixir-backend.onrender.com
```

**Health Check:**
```bash
curl https://athlixir-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-06-13T12:00:00Z"
}
```

**Additional Tests:**
```bash
# Get Swagger documentation
curl https://athlixir-backend.onrender.com/api/docs

# Test authentication
curl -X POST https://athlixir-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### 6.4 Verify AI Engine (Render)

**URL Format:**
```
https://athlixir-ai-engine.onrender.com
```

**Health Check:**
```bash
curl https://athlixir-ai-engine.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "athlixir-ai-engine"
}
```

**Test API:**
```bash
curl -X POST https://athlixir-ai-engine.onrender.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://...","api_secret":"your-secret"}'
```

### 6.5 Check Logs

**Render Server Logs:**
1. Go to Render dashboard
2. Select `athlixir-backend` service
3. Click **Logs** tab
4. Check for errors

**Render AI Engine Logs:**
1. Go to Render dashboard
2. Select `athlixir-ai-engine` service
3. Click **Logs** tab
4. Check for errors

**Vercel Client Logs:**
1. Go to Vercel dashboard
2. Select `athlixir` project
3. Click **Deployments**
4. Select latest deployment
5. Click **Runtime Logs**

### 6.6 Test Full API Flow

```bash
# 1. Test server health
curl https://athlixir-backend.onrender.com/api/health

# 2. Test AI engine health
curl https://athlixir-ai-engine.onrender.com/health

# 3. Open client in browser
https://athlixir.vercel.app

# 4. Try authentication
# Fill login form and check browser Network tab
```

---

# 7. DIRECTORY STRUCTURE & BUILD DETAILS

## Root Directory Structure

```
Athlixir_Product/
├── client/                          # Next.js Frontend
│   ├── app/                         # App directory
│   ├── public/                      # Static files
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── vercel.json                  # Vercel config
│   └── Dockerfile                   # For containerization
│
├── server/                          # NestJS Backend
│   ├── src/                         # Source code
│   ├── test/                        # Test files
│   ├── dist/                        # Build output (generated)
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── render.yaml                  # Render config
│   ├── Dockerfile
│   └── .dockerignore
│
├── ai-engine/                       # FastAPI AI Service
│   ├── app/                         # Application code
│   │   ├── api/
│   │   ├── biomechanics/
│   │   ├── calibration/
│   │   ├── detection/
│   │   ├── pipelines/
│   │   ├── pose/
│   │   ├── scoring/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── worker.py
│   ├── scripts/                     # Test scripts
│   ├── requirements.txt
│   ├── render.yaml                  # Render config
│   ├── Dockerfile
│   ├── start.sh
│   └── .dockerignore
│
├── .github/workflows/               # GitHub Actions
│   ├── client-deploy.yml
│   ├── server-deploy.yml
│   └── ai-engine-deploy.yml
│
└── CI_CD_SETUP.md                   # Documentation
```

---

# 8. BUILD & START COMMANDS

## Client (Next.js)

**Root Directory:** `client/`

**Build Command:**
```bash
pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Development:**
```bash
pnpm dev
```

**Output:** `.next/` directory

---

## Server (NestJS)

**Root Directory:** `server/`

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start:prod
# or
node dist/main.js
```

**Development:**
```bash
pnpm start:dev
```

**Output:** `dist/` directory

---

## AI Engine (FastAPI)

**Root Directory:** `ai-engine/`

**Build Command (Docker):**
```bash
docker build -t athlixir-ai-engine:latest .
```

**Start Command (Docker):**
```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e HOST=0.0.0.0 \
  athlixir-ai-engine:latest
```

**Start Command (Direct):**
```bash
python app/main.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

**Dependencies:** `requirements.txt`

---

# 9. ENVIRONMENT VARIABLES SUMMARY

## GitHub Actions (Secrets)

```
Total: 17 secrets
Used by workflows for deployment
All stored securely in GitHub
```

## Vercel Environment Variables

```
NEXT_PUBLIC_API_URL = https://athlixir-backend.onrender.com
```

## Render - Server Environment Variables

```
NODE_ENV = production
PORT = 3001
FASTAPI_URL = https://athlixir-ai-engine.onrender.com/api/analyze
FASTAPI_INTEL_URL = https://athlixir-ai-engine.onrender.com/api/analyze/intelligence
FASTAPI_PUBLIC_URL = https://athlixir-ai-engine.onrender.com
FIREBASE_PROJECT_ID = (from Firebase)
FIREBASE_CLIENT_EMAIL = (from Firebase)
FIREBASE_PRIVATE_KEY = (from Firebase)
FIREBASE_STORAGE_BUCKET = (from Firebase)
FIREBASE_WEB_API_KEY = (from Firebase)
GEMINI_API_KEY = (from Google)
CLAUDE_API_KEY = (from Anthropic)
INTERNAL_API_SECRET = (generated secret)
REDIS_HOST = (Redis provider)
REDIS_PORT = 6379
```

## Render - AI Engine Environment Variables

```
PORT = 8080
HOST = 0.0.0.0
PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION = python
INTERNAL_API_SECRET = (generated secret)
REDIS_HOST = (Redis provider)
REDIS_PORT = 6379
```

---

# 10. TROUBLESHOOTING

## Deployment Failed

### Check GitHub Actions Logs
1. Go to **Actions** tab
2. Click failed workflow
3. Expand failed step
4. Read error message
5. Common issues:
   - Missing secrets → Add to GitHub
   - Build failed → Check code for syntax errors
   - Tests failed → Run tests locally

### Check Render Logs
1. Go to Render dashboard
2. Select service
3. Click **Logs**
4. Check for errors
5. Common issues:
   - Port mismatch → Check environment variables
   - Missing env vars → Add to Render settings
   - Startup error → Check start command

### Check Vercel Logs
1. Go to Vercel dashboard
2. Click project
3. Go to **Deployments**
4. Select deployment
5. Click **Runtime Logs**

---

# 11. QUICK REFERENCE

## All URLs After Deployment

```
Client:       https://athlixir.vercel.app
Server API:   https://athlixir-backend.onrender.com
AI Engine:    https://athlixir-ai-engine.onrender.com
```

## Health Check Commands

```bash
# Client (browser)
https://athlixir.vercel.app

# Server
curl https://athlixir-backend.onrender.com/api/health

# AI Engine
curl https://athlixir-ai-engine.onrender.com/health
```

## Update Deployment

After making changes:
```bash
git add .
git commit -m "your change"
git push origin main
# GitHub Actions automatically deploys
```

---

## ✅ DEPLOYMENT CHECKLIST

**Before Starting:**
- [ ] Docker Hub account created
- [ ] Vercel account created
- [ ] Render account created
- [ ] Firebase project setup complete
- [ ] All API keys obtained

**Docker Hub:**
- [ ] Access token created
- [ ] AI Engine repository created
- [ ] `DOCKER_USERNAME` & `DOCKER_PASSWORD` saved

**Render:**
- [ ] Server web service created
- [ ] AI Engine docker service created
- [ ] Service IDs saved
- [ ] API token created
- [ ] All environment variables added

**Vercel:**
- [ ] Project created
- [ ] Project ID saved
- [ ] Token created
- [ ] Org ID saved
- [ ] NEXT_PUBLIC_API_URL added

**GitHub:**
- [ ] All 17 secrets added
- [ ] Workflows present
- [ ] First deployment triggered

**Verification:**
- [ ] Client loads at vercel.app
- [ ] Server health check passes
- [ ] AI Engine health check passes
- [ ] Client can call server API
- [ ] Full flow works end-to-end

---

**🎉 All Set! You're ready to deploy!**

