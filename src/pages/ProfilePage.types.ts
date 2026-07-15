import { z } from 'zod';
import { addressZodShape, tenantAddressZodShape } from '@/shared/forms/addressFields';
import type { AddressDto } from '@/types/api';
import type { FieldConfig } from 'mui-schema-form-builder';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
});

export const addressSchema = z.object(addressZodShape);

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  ...tenantAddressZodShape,
});

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─── Value types ──────────────────────────────────────────────────────────────

export type ProfileValues = z.infer<typeof profileSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type CompanyValues = z.infer<typeof companySchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;

// ─── Component prop types ─────────────────────────────────────────────────────

export interface ProfileAvatarSectionProps {
  avatarSrc: string | null;
  initials: string;
  avatarUploading: boolean;
  avatarRemoving: boolean;
  fullName: string | undefined;
  email: string | undefined;
  systemRole: string | undefined;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
}

export interface ProfileInfoSectionProps {
  profileId: string | undefined;
  email: string | undefined;
  profileFields: FieldConfig[];
  onProfileSubmit: (values: ProfileValues) => Promise<void>;
}

export interface ProfileAddressSectionProps {
  profileId: string | undefined;
  addressFields: FieldConfig[];
  onAddressSubmit: (values: AddressValues) => Promise<void>;
}

export interface ProfilePasswordSectionProps {
  passwordFields: FieldConfig[];
  onPasswordSubmit: (values: PasswordValues) => Promise<void>;
}

export interface ProfileCompanySectionProps {
  tenantSettings:
    | {
        id: string;
        name?: string;
        profileFileId?: string | null;
        address?: AddressDto | null;
      }
    | undefined;
  tenantLogoSrc: string | null;
  logoUploading: boolean;
  logoRemoving: boolean;
  companyFields: FieldConfig[];
  onTenantLogoUpload: (file: File) => Promise<void>;
  onTenantLogoRemove: () => Promise<void>;
  onCompanySubmit: (values: CompanyValues) => Promise<void>;
}
