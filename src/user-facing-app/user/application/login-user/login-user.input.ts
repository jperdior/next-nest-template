import { z } from "zod";

/**
 * Zod schema for Login User input validation
 */
export const LoginUserInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserInput = z.infer<typeof LoginUserInputSchema>;
