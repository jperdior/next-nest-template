import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Input for generating JWT access token
 */
export interface GenerateTokenInput {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT Service
 * Handles generation and signing of JWT tokens
 */
export class JWTService {
  /**
   * Generate a JWT access token
   * 
   * @param input - User data to encode in token
   * @param secret - Secret key for signing
   * @param expiresIn - Token expiration (default: 7d)
   * @returns Signed JWT token string
   */
  generateAccessToken(
    input: GenerateTokenInput,
    secret: string,
    expiresIn?: string | number
  ): string {
    if (!secret) {
      throw new Error('JWT secret is required');
    }

    const options: SignOptions = {
      expiresIn: expiresIn || '7d',
    };

    return jwt.sign(
      {
        sub: input.userId,
        email: input.email,
        roles: [input.role],
      },
      secret,
      options
    );
  }
}
