import { PrismaService } from '@testproject/database';
import { execSync } from 'child_process';
import { join } from 'path';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@postgres:5432/testproject_test?schema=public';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '7d';
process.env.SKIP_EMAIL_VERIFICATION = 'true';
process.env.AUTO_ACTIVATE_USERS = 'true';

// Global Prisma instance for test database management
let globalPrisma: PrismaService;

// Run once before all tests
beforeAll(async () => {
  console.log('🔧 Setting up test database...');

  globalPrisma = new PrismaService();
  await globalPrisma.$connect();

  // Drop and recreate schema to ensure clean state
  // This handles cases where previous test runs crashed without cleanup
  console.log('🗑️ Resetting test database schema...');
  try {
    await globalPrisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
    await globalPrisma.$executeRawUnsafe('CREATE SCHEMA public');
    await globalPrisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO postgres');
    await globalPrisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO public');
  } catch (error) {
    console.error('Failed to reset schema:', error);
    throw error;
  }

  // Run migrations on test database
  console.log('📦 Running migrations...');
  try {
    // Compute migration directory dynamically
    // In Docker: /app/apps/user-app/backend/test -> ../../../../ -> /app
    const migrationDir =
      process.env.PRISMA_MIGRATE_PATH ||
      join(__dirname, '../../../../src/shared/infrastructure/persistence');

    execSync(`cd ${migrationDir} && pnpm prisma migrate deploy`, {
      env: { ...process.env },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }

  console.log('✅ Test database ready');
}, 60000); // 60s timeout for migrations

// Run once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test database...');

  // Drop and recreate schema to ensure clean state for next run
  await globalPrisma.$executeRawUnsafe('DROP SCHEMA public CASCADE');
  await globalPrisma.$executeRawUnsafe('CREATE SCHEMA public');

  await globalPrisma.$disconnect();
  console.log('✅ Cleanup complete');
});

// Clean tables before each test (for isolation)
beforeEach(async () => {
  // Use transaction for efficient cleanup
  await globalPrisma.$transaction([
    globalPrisma.user.deleteMany(),
    // Add other model deletions here as they're created
  ]);
});
