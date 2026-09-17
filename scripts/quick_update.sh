#!/bin/bash
set -e

echo "[1/2] Updating rac3011-api..."
cd /home/ubuntu/rac3011-api
git pull origin main

echo "[2/2] Rebuilding and restarting containers..."
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api worker

echo "=== UPDATE COMPLETED ==="
