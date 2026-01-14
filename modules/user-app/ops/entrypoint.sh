#!/bin/sh
set -e

echo "🔧 Running database migrations for all contexts..."

# Run migrations for each context
for context_db in /app/shared/contexts/*/infrastructure/database; do
  if [ -d "$context_db/prisma" ]; then
    context_name=$(echo $context_db | sed 's|.*/contexts/\(.*\)/infrastructure.*|\1|')
    echo "  → Migrating context: $context_name"
    cd "$context_db"
    pnpm prisma migrate deploy || echo "⚠️  No migrations to apply for $context_name"
  fi
done

echo "✅ Migrations complete!"

# Navigate back to backend directory
cd /app/modules/user-app/backend

# Start the application
echo "🚀 Starting application..."
exec "$@"
