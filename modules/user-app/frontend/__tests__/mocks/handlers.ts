import { rest } from 'msw';

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
  rest.post(`${API_URL}/auth/register`, (req, res, ctx) => {
    const body = req.body as RegisterRequest;
    
    // Simulate validation
    if (!body.email || !body.password || !body.name) {
      return res(
        ctx.status(400),
        ctx.json({ statusCode: 400, message: 'Missing required fields' })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        accessToken: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: body.email,
          name: body.name,
          role: 'ROLE_USER',
        },
      })
    );
  }),

  // Login endpoint
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const body = req.body as LoginRequest;
    
    // Simulate authentication
    if (body.email === 'test@example.com' && body.password === 'Test123456!') {
      return res(
        ctx.json({
          accessToken: 'mock-jwt-token',
          user: {
            id: 'mock-user-id',
            email: body.email,
            name: 'Test User',
            role: 'ROLE_USER',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ statusCode: 401, message: 'Invalid credentials' })
    );
  }),
];
