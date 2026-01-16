import '@testing-library/jest-dom';
import { fetch, Headers, Request, Response } from 'whatwg-fetch';
import { server } from './__tests__/mocks/server';

// Polyfill fetch for Jest environment
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Establish API mocking before all tests
// Error on unhandled requests to ensure all network calls are mocked
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that are declared in individual tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
