import { z } from "zod";

export const RegisterUserInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;
