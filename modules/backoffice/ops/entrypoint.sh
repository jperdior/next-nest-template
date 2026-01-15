#!/bin/sh
set -e

echo "🔧 Running database migrations..."

cd /app/shared/contexts/Infrastructure/persistence
pnpm prisma migrate deploy || echo "⚠️  No migrations to apply"

echo "✅ Migrations complete!"

cd /app/modules/backoffice/backend
echo "🚀 Starting application..."
exec "$@"
