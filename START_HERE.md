# 🚀 START HERE - Deployment Instructions

## Complete CI/CD & Deployment Setup for Athlixir

**Created:** June 13, 2026  
**Status:** ✅ READY FOR DEPLOYMENT  
**Time Needed:** ~45 minutes

---

## 📚 Read These Files in Order

### Step 1: Understand the Architecture (5 min)
**File:** `CI_CD_SETUP.md`
- Explains how the CI/CD pipeline works
- Shows what gets tested
- Overview of deployment flow

### Step 2: Follow the Complete Guide (30 min) ⭐ MAIN FILE
**File:** `DEPLOYMENT_GUIDE.md` 
- **Read this file carefully from top to bottom**
- Section 1: Docker Hub Setup (Create account + token)
- Section 2: Deploy Server to Render
- Section 3: Deploy AI Engine to Render  
- Section 4: Deploy Client to Vercel
- Section 5: Add GitHub Secrets
- Section 6: Verify deployments
- Sections 7-11: Reference information

### Step 3: Use as Quick Reference (ongoing)
**File:** `QUICK_DEPLOY_CHECKLIST.md`
- Use this to track your progress
- Checkboxes for each step
- ~45 minutes total

### Step 4: Secrets Reference (as needed)
**File:** `GITHUB_SECRETS_TEMPLATE.md`
- Where to get each secret
- How to add secrets to GitHub
- Quick lookup

---

## ⏱️ Time Breakdown

```
Docker Hub Setup:           5 minutes
Render Server Setup:        10 minutes
Render AI Engine Setup:     15 minutes (includes Docker build)
Vercel Client Setup:        5 minutes
GitHub Secrets Setup:       5 minutes
Verification:               5 minutes
─────────────────────────────────────
TOTAL:                      ~45 minutes
```

---

## 🎯 What Gets Deployed

### 1. **CLIENT** → Vercel
- **What:** Next.js 14 frontend
- **Tests:** Playwright E2E tests
- **URL:** `https://athlixir.vercel.app`
- **Time:** 5 min

### 2. **SERVER** → Render
- **What:** NestJS backend API
- **Tests:** Jest unit + E2E tests
- **URL:** `https://athlixir-backend.onrender.com`
- **Time:** 10 min

### 3. **AI ENGINE** → Render (Docker)
- **What:** FastAPI with Python/MediaPipe
- **Tests:** Python E2E + determinism tests
- **URL:** `https://athlixir-ai-engine.onrender.com`
- **Time:** 15 min (Docker build)

---

## 🔄 How It Works After Deployment

```
You: git push origin main
     ↓
GitHub Actions automatically:
  1. Runs all tests
  2. If ALL tests pass → deploys all 3 services
  3. If ANY test fails → stops, shows error

Result: Only working code gets deployed!
```

---

## 📋 Pre-Deployment Checklist

Before you start, make sure you have:

- [ ] GitHub account with repo access
- [ ] Internet connection
- [ ] ~45 minutes of time
- [ ] Accounts you need to create:
  - [ ] Docker Hub (hub.docker.com)
  - [ ] Render (render.com)
  - [ ] Vercel (vercel.com) - or connect existing account
- [ ] API Keys you need to collect:
  - [ ] Firebase credentials
  - [ ] Gemini API key
  - [ ] Claude API key

---

## 🎯 The 5 Main Steps

### STEP 1: Create Accounts & Get Tokens
- Docker Hub account + access token
- Render account + API token
- Vercel account + token

**Where:** DEPLOYMENT_GUIDE.md Sections 1, 2.4, 4.4

---

### STEP 2: Deploy Server to Render
1. Render Dashboard → New Web Service
2. Select your repo + `server` folder
3. Set environment variables
4. Wait for deployment (3-5 min)
5. **SAVE:** Service ID

**Where:** DEPLOYMENT_GUIDE.md Section 2

---

### STEP 3: Deploy AI Engine to Render
1. Render Dashboard → New Web Service (Docker)
2. Select your repo + `ai-engine` folder
3. Set environment variables
4. Wait for Docker build (10-15 min)
5. **SAVE:** Service ID

**Where:** DEPLOYMENT_GUIDE.md Section 3

---

### STEP 4: Deploy Client to Vercel
1. Vercel Dashboard → New Project
2. Select your repo + `client` folder
3. Set environment variables
4. Wait for build (2-3 min)
5. **SAVE:** Project ID

**Where:** DEPLOYMENT_GUIDE.md Section 4

---

### STEP 5: Add GitHub Secrets & Verify
1. Add all 17 secrets to GitHub Actions
2. Test that all 3 services work
3. Done! 🎉

**Where:** DEPLOYMENT_GUIDE.md Section 5 & 6

---

## 📖 File Guide

| File | Purpose | Read When |
|------|---------|-----------|
| **START_HERE.md** | This file - quick overview | First |
| **DEPLOYMENT_GUIDE.md** | Complete step-by-step guide | During setup |
| **QUICK_DEPLOY_CHECKLIST.md** | Track your progress | During setup |
| **CI_CD_SETUP.md** | How the pipeline works | After setup |
| **GITHUB_SECRETS_TEMPLATE.md** | Where to get each secret | When adding secrets |

---

## 🔑 Secrets You'll Need (17 Total)

**VERCEL:** 4 secrets
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_CLIENT_PROJECT_ID
- NEXT_PUBLIC_API_URL

**RENDER:** 3 secrets
- RENDER_API_TOKEN
- RENDER_SERVER_SERVICE_ID
- RENDER_AI_ENGINE_SERVICE_ID

**FIREBASE:** 5 secrets
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_STORAGE_BUCKET
- FIREBASE_WEB_API_KEY

**APIs:** 2 secrets
- GEMINI_API_KEY
- CLAUDE_API_KEY

**INTERNAL:** 3 secrets
- INTERNAL_API_SECRET
- DOCKER_USERNAME
- DOCKER_PASSWORD

---

## 🌐 Your Deployed URLs (After Setup)

```
CLIENT:     https://athlixir.vercel.app
SERVER:     https://athlixir-backend.onrender.com
AI ENGINE:  https://athlixir-ai-engine.onrender.com
```

---

## ❓ Questions?

- **How does testing work?** → See DEPLOYMENT_GUIDE.md Section 6
- **Where do I get secrets?** → See GITHUB_SECRETS_TEMPLATE.md
- **What are environment variables?** → See DEPLOYMENT_GUIDE.md Section 9
- **Something went wrong?** → See DEPLOYMENT_GUIDE.md Section 10

---

## ✅ Success Criteria

After deployment, you should see:

1. **GitHub Actions**
   - ✅ 3 workflows present
   - ✅ Latest run shows all tests passed
   - ✅ All deployments completed

2. **Client (Vercel)**
   - ✅ Website loads in browser
   - ✅ No errors in console
   - ✅ Can see API calls in Network tab

3. **Server (Render)**
   - ✅ Health check: `curl https://athlixir-backend.onrender.com/api/health`
   - ✅ Returns: `{"status":"OK"}`
   - ✅ Can see logs with no errors

4. **AI Engine (Render)**
   - ✅ Health check: `curl https://athlixir-ai-engine.onrender.com/health`
   - ✅ Returns: `{"status":"healthy"}`
   - ✅ Can see logs with no errors

5. **Full Flow**
   - ✅ Client talks to Server
   - ✅ Server talks to AI Engine
   - ✅ Data flows end-to-end

---

## 🎯 Next Action

**👉 Open `DEPLOYMENT_GUIDE.md` now and follow Section 1 (Docker Hub Setup)**

---

## 📞 Quick Help

**Where is my Docker Hub token?**  
→ hub.docker.com → Settings → Security → New Access Token

**Where is my Render API token?**  
→ render.com → Account → API Tokens → Create API Key

**Where is my Vercel token?**  
→ vercel.com → Account → Tokens → Create Token

**Where is my Firebase project info?**  
→ console.firebase.google.com → Project Settings

**I got an error, what do I do?**  
→ Check DEPLOYMENT_GUIDE.md Section 10 (Troubleshooting)

---

## 🎉 Ready?

**Start with DEPLOYMENT_GUIDE.md Section 1 (Docker Hub)**

Good luck! You've got this! 🚀

