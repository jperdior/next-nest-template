import '@testing-library/jest-dom';
import { server } from './__tests__/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared in individual tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
