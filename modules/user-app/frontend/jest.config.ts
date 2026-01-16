import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Set up polyfills before test framework (required for MSW v2)
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Handle MSW v2 ES modules and its dependencies (including pnpm structure)
  transformIgnorePatterns: [
    'node_modules/(?!.*(msw|@mswjs|until-async).*)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  // Help Jest resolve MSW's export conditions and provide fetch globals
  testEnvironmentOptions: {
    customExportConditions: [''],
    url: 'http://localhost',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};

export default createJestConfig(config);
