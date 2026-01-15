import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Register request payload */
interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

/** Login request payload */
interface LoginRequest {
  email: string;
  password: string;
}

export const handlers = [
  // Register endpoint
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    
    // Simulate validation
    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        accessToken: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: body.email,
          name: body.name,
          role: 'ROLE_USER',
        },
      },
      { status: 201 }
    );
  }),

  // Login endpoint
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    // Simulate authentication
    if (body.email === 'test@example.com' && body.password === 'Test123456!') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: body.email,
          name: 'Test User',
          role: 'ROLE_USER',
        },
      });
    }
    
    return HttpResponse.json(
      { statusCode: 401, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
