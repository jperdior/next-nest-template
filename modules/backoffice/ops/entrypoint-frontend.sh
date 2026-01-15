#!/bin/sh
set -e

echo "📦 Installing dependencies..."
cd /app
pnpm install --no-frozen-lockfile

cd /app/modules/backoffice/frontend
echo "🚀 Starting Next.js dev server..."
exec "$@"
