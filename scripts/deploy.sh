#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Starting Athlixir Automated Deployment"
echo "=========================================="

cd /home/ubuntu

# 1. Pull the latest images from Docker Hub
echo "📦 Pulling latest Docker images from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

# 2. Recreate and start containers
echo "🔄 Recreating and starting containers..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 3. Restart Nginx to refresh internal container IP routing
echo "🌐 Refreshing Nginx reverse proxy..."
docker compose -f docker-compose.prod.yml restart nginx

# 4. Clean up dangling/old images to save EC2 disk space
echo "🧹 Pruning old unused images..."
docker image prune -f

# 5. Health Check Verification
echo "🩺 Performing health verification..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api || true)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Deployment completed successfully! Application is live and healthy."
else
    echo "⚠️ Deployment completed with warning: Health check returned HTTP $HTTP_STATUS"
fi
