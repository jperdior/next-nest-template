import { z } from 'zod';

export const CreateItemInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof CreateItemInputSchema>;
