import { z } from 'zod';

import {
  requiredAddressZodShape,
  requiredTenantAddressZodShape,
} from '@/shared/forms/addressFields';
import type { AcceptInvitationResponse } from '@/types/api';

// â”€â”€â”€ Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const phoneZodShape = z.object({ select: z.string(), input: z.string() }).optional();

const inviteSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: phoneZodShape,
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof inviteSchema>;

const tenantCreationSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: phoneZodShape,
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    tenantName: z.string().min(1, 'Tenant name is required').max(200),
    ...requiredTenantAddressZodShape,
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type TenantCreationValues = z.infer<typeof tenantCreationSchema>;

// â”€â”€â”€ Component prop types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface InvitationInvalidProps {
  message?: string | null;
}

interface InvitationSuccessProps {
  result: AcceptInvitationResponse;
}

export {
  type FormValues,
  type InvitationInvalidProps,
  type InvitationSuccessProps,
  inviteSchema,
  passwordRule,
  phoneZodShape,
  tenantCreationSchema,
  type TenantCreationValues,
};
