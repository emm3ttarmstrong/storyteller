#!/bin/bash
set -e

# Storyteller Deploy Script
# Usage: ./deploy.sh [--skip-build]
#
# Syncs source from workspace, rebuilds, and deploys.
# Run from anywhere — paths are absolute.

WORKSPACE="/data/clawdbot/workspace/storyteller"
DEPLOY_DIR="/data/clawdbot/workspace/the-citadel/active/storyteller"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}>>>${NC} $1"; }
ok()  { echo -e "${GREEN}OK:${NC} $1"; }
err() { echo -e "${RED}ERR:${NC} $1"; exit 1; }

# 1. Sync source (preserve docker-compose.yml and .env)
log "Syncing source from workspace..."
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env' \
  --exclude='docker-compose.yml' \
  "$WORKSPACE/" "$DEPLOY_DIR/" > /dev/null 2>&1
ok "Source synced"

cd "$DEPLOY_DIR"

# 2. Build (unless --skip-build)
if [ "$1" != "--skip-build" ]; then
  log "Building Docker image..."
  docker compose build --no-cache app 2>&1 | tail -3
  ok "Image built"
fi

# 3. Swap container
log "Deploying..."
docker stop storyteller-app 2>/dev/null || true
docker rm storyteller-app 2>/dev/null || true
docker compose up -d 2>&1
ok "Containers started"

# 4. Wait and verify
log "Waiting for startup..."
sleep 6
STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://storyteller.emmett.wtf)
if [ "$STATUS" = "200" ]; then
  ok "storyteller.emmett.wtf is live (HTTP $STATUS)"
else
  err "Site returned HTTP $STATUS — check: docker logs storyteller-app --tail 20"
fi
