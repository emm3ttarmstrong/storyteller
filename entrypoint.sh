#!/bin/sh
set -e

echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss || echo "Schema sync warning, continuing..."

echo "Starting server..."
exec node server.js
