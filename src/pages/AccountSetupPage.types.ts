import { z } from 'zod';
import { requiredAddressZodShape } from '@/shared/forms/addressFields';
import type { SetPasswordResponse } from '@/types/api';

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const directPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const fullSetupSchema = z
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

type DirectPasswordValues = z.infer<typeof directPasswordSchema>;
type FullSetupValues = z.infer<typeof fullSetupSchema>;

interface SetupInvalidProps {
  message?: string | null;
}

interface SetupSuccessProps {
  result: SetPasswordResponse;
}

export {
  passwordRule,
  directPasswordSchema,
  fullSetupSchema,
  type DirectPasswordValues,
  type FullSetupValues,
  type SetupInvalidProps,
  type SetupSuccessProps,
};
