import jwt from 'jsonwebtoken';
import { JWTPayload, JWTPayloadSchema, AuthUser } from './types';

/**
 * Decode and validate a JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function decodeJWT(token: string): JWTPayload {
  try {
    // Decode without verification (verification should be done by backend)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Validate structure with Zod
    return JWTPayloadSchema.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify JWT token with secret
 * 
 * @param token - JWT token string
 * @param secret - Secret key used to sign the token
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function verifyJWT(token: string, secret: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, secret);
    return JWTPayloadSchema.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to verify JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract user information from JWT token
 * 
 * @param token - JWT token string
 * @returns Auth user object
 */
export function extractUser(token: string): AuthUser {
  const payload = decodeJWT(token);
  
  return {
    id: payload.sub,
    email: payload.email,
    roles: payload.roles,
  };
}

/**
 * Check if JWT token is expired
 * 
 * @param token - JWT token string
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}
