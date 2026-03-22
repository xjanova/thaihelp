#!/bin/bash
# ============================================
# ThaiHelp Deploy Script
# Server: thaihelp.xman4289.com
# Path: /home/admin/domains/thaihelp.xman4289.com
# ============================================
set -e

DOMAIN="thaihelp.xman4289.com"
BASE_DIR="/home/admin/domains/${DOMAIN}"
APP_DIR="${BASE_DIR}/app"
PUBLIC_DIR="${BASE_DIR}/public_html"
BACKUP_DIR="${BASE_DIR}/backups"
REPO_URL="https://github.com/xjanova/thaihelp.git"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${CYAN}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo "============================================"
echo "  🚀 ThaiHelp Deploy — ${DOMAIN}"
echo "  $(date)"
echo "============================================"
echo ""

# 1. Create directories
info "Creating directories..."
mkdir -p ${APP_DIR} ${BACKUP_DIR} ${PUBLIC_DIR}

# 2. Backup current version
if [ -f "${APP_DIR}/server.js" ]; then
  info "Backing up current version..."
  tar -czf ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz -C ${APP_DIR} . 2>/dev/null || true
  log "Backup: ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
fi

# 3. Clone/pull repo
if [ -d "${BASE_DIR}/repo/.git" ]; then
  info "Pulling latest code..."
  cd ${BASE_DIR}/repo && git pull origin main
else
  info "Cloning repository..."
  git clone ${REPO_URL} ${BASE_DIR}/repo
fi
cd ${BASE_DIR}/repo
log "Code updated"

# 4. Install dependencies
info "Installing dependencies..."
npm ci --legacy-peer-deps 2>&1 | tail -3
log "Dependencies installed"

# 5. Create .env.local if not exists
if [ ! -f "${BASE_DIR}/repo/.env.local" ]; then
  warn "No .env.local found! Creating from template..."
  cp .env.example .env.local
  warn "⚠️  EDIT .env.local with your actual API keys!"
  warn "   nano ${BASE_DIR}/repo/.env.local"
fi

# 6. Build
info "Building production..."
npx next build 2>&1 | tail -5
log "Build complete"

# 7. Deploy standalone build
info "Deploying to ${APP_DIR}..."
rm -rf ${APP_DIR}/*
cp -r .next/standalone/* ${APP_DIR}/
cp -r .next/static ${APP_DIR}/.next/static
cp -r public ${APP_DIR}/public
cp .env.local ${APP_DIR}/.env.local 2>/dev/null || true
cp ecosystem.config.js ${APP_DIR}/
log "Files deployed"

# 8. Start/restart with PM2
info "Starting application..."
cd ${APP_DIR}
if command -v pm2 &> /dev/null; then
  pm2 describe thaihelp > /dev/null 2>&1 && \
    pm2 restart thaihelp || \
    pm2 start server.js --name thaihelp -i 1 -- -p 3000
  pm2 save
  log "PM2 started/restarted"
else
  warn "PM2 not installed! Install: npm install -g pm2"
  warn "Then run: cd ${APP_DIR} && PORT=3000 pm2 start server.js --name thaihelp"
fi

# 9. Health check
info "Health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "Health check PASSED (HTTP ${HTTP_CODE})"
else
  warn "Health check returned HTTP ${HTTP_CODE} — app may still be starting"
fi

echo ""
echo "============================================"
echo "  ✅ Deploy complete!"
echo ""
echo "  🌐 https://${DOMAIN}"
echo "  📂 App: ${APP_DIR}"
echo "  📂 Repo: ${BASE_DIR}/repo"
echo ""
echo "  Commands:"
echo "    pm2 logs thaihelp    # View logs"
echo "    pm2 restart thaihelp # Restart"
echo "    pm2 status           # Status"
echo "============================================"
echo ""
