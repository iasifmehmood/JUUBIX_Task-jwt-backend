import { z } from 'zod';

export const nameEmailPasswordSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(6),
});
