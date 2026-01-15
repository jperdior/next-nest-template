#!/bin/sh
set -e

echo "📦 Installing dependencies..."
cd /app
pnpm install --no-frozen-lockfile

echo "🔧 Building shared packages..."
# Build database package first (user-context depends on it)
cd /app/shared/contexts/Infrastructure/persistence
pnpm prisma generate
pnpm build

# Build user context
cd /app/shared/contexts/user
pnpm build

echo "🔧 Running database migrations..."
cd /app/shared/contexts/Infrastructure/persistence
pnpm prisma migrate deploy || echo "⚠️  No migrations to apply or migration failed"

echo "✅ Setup complete!"
echo "🚀 Starting application..."
cd /app/modules/backoffice/backend
exec "$@"
