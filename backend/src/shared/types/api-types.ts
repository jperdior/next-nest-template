/**
 * Re-exports API types from the shared package for convenient use in backend code.
 *
 * This file provides easy access to API request/response types generated from OpenAPI spec.
 *
 * Usage:
 *   import { CreateItemRequest, ItemResponse } from '@/shared/types/api-types';
 */

import type { components } from "@testproject/api-types";

// Request types
export type CreateItemRequest = components["schemas"]["CreateItemRequest"];

// Response types
export type ItemResponse = components["schemas"]["ItemResponse"];
export type ErrorResponse = components["schemas"]["Error"];

// Type utilities
export type ApiComponents = components;
