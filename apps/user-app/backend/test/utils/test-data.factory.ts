import { randomUUID } from 'crypto';

/**
 * Factory functions for creating test data
 * Reusable across all tests
 */
export class TestDataFactory {
  static createRegisterDto(
    overrides?: Partial<{
      email: string;
      name: string;
      password: string;
    }>
  ): { email: string; name: string; password: string } {
    return {
      email: `test-${randomUUID()}@example.com`,
      name: 'Test User',
      password: 'Test123456!',
      ...overrides,
    };
  }

  static createLoginDto(
    email: string,
    password: string = 'Test123456!'
  ): { email: string; password: string } {
    return {
      email,
      password,
    };
  }

  // Add more factories as needed
}
