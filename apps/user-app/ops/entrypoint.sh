#!/bin/sh
set -e

echo "📦 Installing dependencies..."
cd /app
pnpm install --no-frozen-lockfile

echo "🔧 Building shared packages..."
# Build shared kernel first
cd /app/src/shared
pnpm build

# Build database package
cd /app/src/shared/infrastructure/persistence
pnpm prisma generate
pnpm build

# Build user-facing-app context
cd /app/src/user-facing-app
pnpm build

echo "🔧 Running database migrations..."
cd /app/src/shared/infrastructure/persistence
pnpm prisma migrate deploy || echo "⚠️  No migrations to apply or migration failed"

echo "✅ Setup complete!"
echo "🚀 Starting application..."
cd /app/apps/user-app/backend
exec "$@"
