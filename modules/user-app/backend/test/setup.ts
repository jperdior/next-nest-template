import { PrismaService } from '@testproject/database';
import { execSync } from 'child_process';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 
  'postgresql://postgres:postgres@postgres:5432/testproject_test?schema=public';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '7d';

// Global Prisma instance for test database management
let globalPrisma: PrismaService;

// Run once before all tests
beforeAll(async () => {
  console.log('🔧 Setting up test database...');
  
  globalPrisma = new PrismaService();
  await globalPrisma.$connect();
  
  // Run migrations on test database
  console.log('📦 Running migrations...');
  try {
    execSync('cd /app/shared/contexts/Infrastructure/persistence && pnpm prisma migrate deploy', {
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
  // Delete in order to respect foreign keys
  await globalPrisma.user.deleteMany();
  // Add other models here as they're created
});
