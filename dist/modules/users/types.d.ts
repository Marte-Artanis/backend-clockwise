import { z } from 'zod';
import type { User } from '../../generated/prisma';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
export type AuthResponse = {
    success: boolean;
    token?: string;
    user?: PublicUser;
    error?: string;
    message?: string;
};
//# sourceMappingURL=types.d.ts.map