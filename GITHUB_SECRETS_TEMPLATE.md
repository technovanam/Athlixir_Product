# GitHub Secrets Setup Template

## Quick Reference - Copy this list and add to GitHub

Add all of these secrets to: **Settings → Secrets and variables → Actions**

### 1. VERCEL (Client Deployment)
```
VERCEL_TOKEN = <your-vercel-api-token>
VERCEL_ORG_ID = <your-vercel-org-id>
VERCEL_CLIENT_PROJECT_ID = <your-vercel-client-project-id>
NEXT_PUBLIC_API_URL = https://your-backend-domain.com
```

### 2. RENDER (Server & AI Engine Deployment)
```
RENDER_API_TOKEN = <your-render-api-token>
RENDER_SERVER_SERVICE_ID = <your-server-service-id>
RENDER_AI_ENGINE_SERVICE_ID = <your-ai-engine-service-id>
```

### 3. FIREBASE (Backend)
```
FIREBASE_PROJECT_ID = your-firebase-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET = your-bucket.firebasestorage.app
FIREBASE_WEB_API_KEY = AIzaSyB8...
```

### 4. API KEYS
```
GEMINI_API_KEY = <your-gemini-api-key>
CLAUDE_API_KEY = <your-claude-api-key>
```

### 5. INTERNAL SECRETS
```
INTERNAL_API_SECRET = <your-generated-secret-key>
```

### 6. DOCKER (AI Engine)
```
DOCKER_USERNAME = <your-docker-hub-username>
DOCKER_PASSWORD = <your-docker-hub-access-token>
```

---

## How to Get Each Secret

### VERCEL_TOKEN
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token

### VERCEL_ORG_ID
1. Go to https://vercel.com/dashboard
2. Click your team/org name
3. Go to Settings → General
4. Copy the "ID" value

### VERCEL_CLIENT_PROJECT_ID
1. Go to your Vercel project
2. Go to Settings → General
3. Copy the "Project ID" value

### RENDER_API_TOKEN
1. Go to https://dashboard.render.com/account/api-tokens
2. Click "Create API Key"
3. Copy the token

### RENDER_SERVER_SERVICE_ID
1. Go to your Render Backend service
2. Go to Settings
3. Copy the Service ID (e.g., "srv-abc123")

### RENDER_AI_ENGINE_SERVICE_ID
1. Go to your Render AI Engine service
2. Go to Settings
3. Copy the Service ID

### FIREBASE_PROJECT_ID
From Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Project Settings
4. Copy "Project ID"

### FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY
From Firebase Admin SDK:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. You'll get a JSON file with all credentials
4. Extract `client_email` and `private_key`

### FIREBASE_STORAGE_BUCKET
From Firebase Console:
1. Go to Storage section
2. Copy the bucket name (e.g., "project.firebasestorage.app")

### FIREBASE_WEB_API_KEY
From Firebase Console:
1. Go to Project Settings → General
2. Look for "Web API Key" in the Firebase SDK snippet

### GEMINI_API_KEY
1. Go to https://makersuite.google.com/app/apikey
2. Create or copy an existing API key

### CLAUDE_API_KEY
1. Go to https://console.anthropic.com/account/api-keys
2. Create a new API key

### INTERNAL_API_SECRET
Generate a random secret:
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((Get-Random -InputObject (1..32) -Count 32)) 
```

### DOCKER_USERNAME
Your Docker Hub username

### DOCKER_PASSWORD
Go to https://hub.docker.com/settings/security:
1. Click "New Access Token"
2. Give it a name (e.g., "GitHub Actions")
3. Copy the token

---

## Adding Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings**
3. Go to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name (exactly as above)
6. Paste the secret value
7. Click **Add secret**

Repeat for all secrets in the lists above.

---

## Verification

After adding all secrets:
1. Go to Actions tab
2. Trigger a test run (push to main)
3. Check workflow logs
4. Verify all steps pass with "✅"

If any secret is missing, you'll see an error like:
```
Error: Secret 'VERCEL_TOKEN' not found
```

---

## Environment Variables by Service

Once deployment is working, set these in each platform:

### Vercel (Client)
Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://your-api-domain.com
```

### Render (Server)
Environment → Environment Variables:
```
NODE_ENV = production
FASTAPI_URL = https://your-ai-engine-domain.com/api/analyze
FASTAPI_INTEL_URL = https://your-ai-engine-domain.com/api/analyze/intelligence
REDIS_HOST = <your-redis-host>
REDIS_PORT = 6379
```

### Render (AI Engine)
Environment → Environment Variables:
```
PORT = 8080
HOST = 0.0.0.0
PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION = python
REDIS_HOST = <your-redis-host>
REDIS_PORT = 6379
```

