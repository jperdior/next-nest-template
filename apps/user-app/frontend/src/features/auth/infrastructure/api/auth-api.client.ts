import { apiClient } from "@/shared/lib/api-client";
import type {
  components,
  paths,
} from "@/shared/types/api-types";

type RegisterRequest =
  paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];
type LoginRequest =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];
type AuthResponse = components["schemas"]["AuthResponse"];

/**
 * Register a new user
 */
export async function register(
  input: RegisterRequest
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Login with email and password
 */
export async function login(input: LoginRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
