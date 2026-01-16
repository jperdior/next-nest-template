import { z } from "zod";

/**
 * Login Input Schema
 * Client-side validation for login form
 */
export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
