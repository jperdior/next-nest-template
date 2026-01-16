/**
 * API types for the Backoffice application.
 *
 * Re-exports types generated from OpenAPI spec.
 * Located at: apps/backoffice/specs/openapi.yaml
 *
 * To regenerate: make codegen (from apps/backoffice/)
 */

import type { components, paths, operations } from './generated-api-types';

// Schema types
export type CreateItemRequest = components['schemas']['CreateItemRequest'];
export type ItemResponse = components['schemas']['ItemResponse'];
export type ErrorResponse = components['schemas']['Error'];

// API endpoint response types
export type GetItemsResponse = operations['getItems']['responses']['200']['content']['application/json'];
export type CreateItemResponse = operations['createItem']['responses']['201']['content']['application/json'];

// Re-export full generated types for advanced use cases
export type { components, paths, operations };
