/**
 * Re-exports API types from the generated OpenAPI types.
 * 
 * This file provides easy access to API request/response types generated from OpenAPI spec.
 * 
 * Usage:
 *   import { components, paths } from '@/shared/types/api-types';
 *   type RegisterRequest = components['schemas']['RegisterRequest'];
 */

// Re-export the generated types
export type { components, paths } from './generated-api-types';
