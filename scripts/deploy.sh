#!/bin/bash
# ThaiHelp Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENV=${1:-production}
APP_NAME="thaihelp"
APP_DIR="/var/www/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================="
echo "  ThaiHelp Deployment - ${ENV}"
echo "  $(date)"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 1. Backup current version
if [ -d "${APP_DIR}" ]; then
  log "Backing up current version..."
  mkdir -p ${BACKUP_DIR}
  tar -czf ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz -C ${APP_DIR} . 2>/dev/null || true
  log "Backup saved to ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
fi

# 2. Install dependencies
log "Installing dependencies..."
npm ci --production=false

# 3. Build
log "Building application..."
npm run build

# 4. Copy standalone build
log "Deploying to ${APP_DIR}..."
mkdir -p ${APP_DIR}
cp -r .next/standalone/* ${APP_DIR}/
cp -r .next/static ${APP_DIR}/.next/static
cp -r public ${APP_DIR}/public
cp .env.local ${APP_DIR}/.env.local 2>/dev/null || warn ".env.local not found"

# 5. Restart with PM2
log "Restarting application..."
if command -v pm2 &> /dev/null; then
  pm2 describe ${APP_NAME} > /dev/null 2>&1 && pm2 restart ${APP_NAME} || pm2 start ${APP_DIR}/server.js --name ${APP_NAME} --env ${ENV}
  pm2 save
else
  warn "PM2 not found. Install with: npm install -g pm2"
  log "Starting with node..."
  cd ${APP_DIR} && PORT=3000 node server.js &
fi

# 6. Health check
log "Running health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "Health check passed! (HTTP ${HTTP_CODE})"
else
  warn "Health check returned HTTP ${HTTP_CODE}"
fi

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "  URL: https://thaihelp.xman4289.com"
echo "========================================="
