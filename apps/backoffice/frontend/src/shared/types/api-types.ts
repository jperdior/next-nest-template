/**
 * API types for the Backoffice application.
 *
 * These types are defined locally based on the app's OpenAPI spec.
 * Located at: apps/backoffice/specs/openapi.yaml
 *
 * TODO: Consider generating these from OpenAPI spec using openapi-typescript
 */

// Request types
export interface CreateItemRequest {
  name: string;
  description?: string;
}

// Response types
export interface ItemResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// API endpoint response types
export type GetItemsResponse = ItemResponse[];
export type CreateItemResponse = ItemResponse;
