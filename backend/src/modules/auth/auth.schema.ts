import { email, z } from 'zod';

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(4)
})

export type LoginBody = z.infer<typeof loginSchema>