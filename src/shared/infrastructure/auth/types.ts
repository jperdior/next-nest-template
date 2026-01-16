import { z } from 'zod';

/**
 * JWT Payload Schema
 * 
 * Structure of the JWT token issued by the backend.
 * Contains user identification and role information.
 */
export const JWTPayloadSchema = z.object({
  sub: z.string().uuid(),           // User ID
  email: z.string().email(),        // User email
  roles: z.array(z.string()),       // User roles (e.g., ['user', 'admin'])
  iat: z.number(),                  // Issued at timestamp
  exp: z.number(),                  // Expiration timestamp
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

/**
 * User Roles
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * Auth User
 * 
 * Extracted user information from JWT
 */
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}
