import { email, z } from 'zod';

export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(4)
})

export const resetPasswordSchema = z.object({
    email: z.email().trim(),
})

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>
export type LoginBody = z.infer<typeof loginSchema>