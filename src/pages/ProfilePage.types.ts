import type { FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import { addressZodShape, tenantAddressZodShape } from '@/shared/forms/addressFields';
import type { AddressDto } from '@/types/api';

// â”€â”€â”€ Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
});

const addressSchema = z.object(addressZodShape);

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  ...tenantAddressZodShape,
});

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// â”€â”€â”€ Value types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ProfileValues = z.infer<typeof profileSchema>;
type AddressValues = z.infer<typeof addressSchema>;
type CompanyValues = z.infer<typeof companySchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// â”€â”€â”€ Component prop types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ProfileAvatarSectionProps {
  avatarSrc: string | null;
  initials: string;
  fullName: string | undefined;
  email: string | undefined;
  systemRole: string | undefined;
  onOpenModal: () => void;
}

interface ProfileInfoSectionProps {
  profileId: string | undefined;
  email: string | undefined;
  profileFields: FieldConfig[];
  onProfileSubmit: (values: ProfileValues) => Promise<void>;
}

interface ProfileAddressSectionProps {
  profileId: string | undefined;
  addressFields: FieldConfig[];
  onAddressSubmit: (values: AddressValues) => Promise<void>;
}

interface ProfilePasswordSectionProps {
  passwordFields: FieldConfig[];
  onPasswordSubmit: (values: PasswordValues) => Promise<void>;
}

interface ProfileCompanySectionProps {
  tenantSettings:
    | {
        id: string;
        name?: string;
        profileFileId?: string | null;
        address?: AddressDto | null;
      }
    | undefined;
  tenantLogoSrc: string | null;
  companyFields: FieldConfig[];
  onOpenLogoModal: () => void;
  onCompanySubmit: (values: CompanyValues) => Promise<void>;
}

export {
  addressSchema,
  type AddressValues,
  companySchema,
  type CompanyValues,
  passwordSchema,
  type PasswordValues,
  type ProfileAddressSectionProps,
  type ProfileAvatarSectionProps,
  type ProfileCompanySectionProps,
  type ProfileInfoSectionProps,
  type ProfilePasswordSectionProps,
  profileSchema,
  type ProfileValues,
};
