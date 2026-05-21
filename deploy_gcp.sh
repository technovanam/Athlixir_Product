#!/bin/bash

# Exit immediately if any command returns a non-zero status
set -e

# =====================================================================
# ATHLIXIR GCP CLOUD RUN DEPLOYMENT ORCHESTRATOR
# =====================================================================
# This script builds and deploys the Frontend, Backend, and AI Engine
# to Google Cloud Run at the same time in a single execution.
# =====================================================================

# Color configurations for logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# 1. Project Configuration Sanity Check
log_info "Reading active GCP configuration..."
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    log_error "No active Google Cloud Project configured in gcloud CLI."
    log_warn "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

REGION="us-central1"
REPO_NAME="athlixir-repo"
IMAGE_REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

log_info "Deploying Athlete Intelligence Stack to GCP Project: ${GREEN}${PROJECT_ID}${BLUE} in Region: ${GREEN}${REGION}${NC}"

# 2. Enable Required Google Cloud APIs
log_info "Enabling required Google Cloud APIs..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com

# 3. Provision Artifact Registry Repository if not exists
log_info "Checking Docker Artifact Registry repository..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
    log_info "Creating Artifact Registry repository: ${REPO_NAME}..."
    gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location="$REGION"
else
    log_success "Artifact Registry repository already exists."
fi

# =====================================================================
# STEP 4: Build & Deploy AI Engine (FastAPI & MediaPipe)
# =====================================================================
log_info "Deploying Service [1/3]: AI Engine (FastAPI & MediaPipe)..."
gcloud builds submit --tag "${IMAGE_REGISTRY}/ai-engine" ./ai-engine

log_info "Launching Serverless Service: AI Engine..."
gcloud run deploy ai-engine \
  --image "${IMAGE_REGISTRY}/ai-engine" \
  --region "$REGION" \
  --cpu 2 \
  --memory 2Gi \
  --allow-unauthenticated

# Retrieve deployed AI Engine URL dynamically
AI_ENGINE_URL=$(gcloud run services describe ai-engine --region "$REGION" --format='value(status.url)')
log_success "AI Engine live at: ${AI_ENGINE_URL}"

# =====================================================================
# STEP 5: Build & Deploy Backend (NestJS Server)
# =====================================================================
log_info "Deploying Service [2/3]: Backend Server API Gateway..."
gcloud builds submit --tag "${IMAGE_REGISTRY}/server" ./server

log_info "Launching Serverless Service: Backend Server..."
gcloud run deploy server \
  --image "${IMAGE_REGISTRY}/server" \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080,NODE_ENV=production,FASTAPI_URL=${AI_ENGINE_URL}/api/analyze,FASTAPI_INTEL_URL=${AI_ENGINE_URL}/api/analyze/intelligence,FASTAPI_PUBLIC_URL=${AI_ENGINE_URL}"

# Retrieve deployed Backend URL dynamically
BACKEND_URL=$(gcloud run services describe server --region "$REGION" --format='value(status.url)')
log_success "Backend Server API Gateway live at: ${BACKEND_URL}"

# =====================================================================
# STEP 6: Build & Deploy Frontend (Next.js Client)
# =====================================================================
log_info "Deploying Service [3/3]: Next.js Client Website..."
gcloud builds submit --tag "${IMAGE_REGISTRY}/client" ./client

log_info "Launching Serverless Service: Next.js Website..."
gcloud run deploy client \
  --image "${IMAGE_REGISTRY}/client" \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080,NODE_ENV=production,NEXT_PUBLIC_API_URL=${BACKEND_URL}"

WEBSITE_URL=$(gcloud run services describe client --region "$REGION" --format='value(status.url)')

# =====================================================================
# SYNTHESIS & WRAP-UP
# =====================================================================
echo -e "\n====================================================================="
log_success "ATHLIXIR DEPLOYMENT COMPLETE! All 3 components are live in GCP!"
echo -e "====================================================================="
echo -e "💻 ${GREEN}Next.js Frontend Client:${NC}  ${WEBSITE_URL}"
echo -e "🔌 ${GREEN}NestJS Server Gateway:${NC}    ${BACKEND_URL}"
echo -e "🧠 ${GREEN}AI Biomechanics Engine:${NC}   ${AI_ENGINE_URL}"
echo -e "=====================================================================\n"
