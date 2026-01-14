/**
 * Re-exports API types from the shared package for convenient use in frontend code.
 * 
 * This file provides easy access to API request/response types generated from OpenAPI spec.
 * 
 * Usage:
 *   import { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
 */

import type { components, paths } from '@testproject/api-types';

// Request types
export type CreateItemRequest = components['schemas']['CreateItemRequest'];

// Response types
export type ItemResponse = components['schemas']['ItemResponse'];
export type ErrorResponse = components['schemas']['Error'];

// API endpoint types
export type GetItemsResponse = paths['/items']['get']['responses']['200']['content']['application/json'];
export type CreateItemResponse = paths['/items']['post']['responses']['201']['content']['application/json'];

// Type utilities
export type ApiComponents = components;
export type ApiPaths = paths;
