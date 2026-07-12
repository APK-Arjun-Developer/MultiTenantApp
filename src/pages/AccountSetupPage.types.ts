import { z } from 'zod';
import { requiredAddressZodShape } from '@/shared/forms/addressFields';
import type { SetPasswordResponse } from '@/types/api';

export const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

export const directPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const fullSetupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type DirectPasswordValues = z.infer<typeof directPasswordSchema>;
export type FullSetupValues = z.infer<typeof fullSetupSchema>;

export interface SetupInvalidProps {
  message?: string | null;
}

export interface SetupSuccessProps {
  result: SetPasswordResponse;
}
