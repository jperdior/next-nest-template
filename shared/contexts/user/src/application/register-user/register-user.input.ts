import { z } from "zod";

/**
 * Zod schema for Register User input validation
 */
export const RegisterUserInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>\[\]\/\-_=+`~]/, "Password must contain at least one special character"),
});

export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;
