import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  roots: ['<rootDir>/src/'],
  // Allow test suite to pass when no tests exist yet
  passWithNoTests: true,
};

export default config;
