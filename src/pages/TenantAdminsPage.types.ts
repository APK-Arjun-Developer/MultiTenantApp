import type { TenantAdminDto, TenantAdminInvitationDto, AddressDto } from '@/types/api';

// ─── Zod-inferred value shapes ────────────────────────────────────────────────
// These mirror the schemas defined in TenantAdminsPage.tsx so sub-components
// can reference them without importing z.infer at every call site.

export type CreateValues = {
  tenantId: string;
  fullName: string;
  email: string;
  [key: string]: unknown; // address fields spread from requiredAddressZodShape
};

export type InviteValues = {
  tenantId: string;
  email: string;
};

export type EditValues = {
  fullName: string;
  [key: string]: unknown; // address + tenantAddress fields
};

// ─── Action type ──────────────────────────────────────────────────────────────

export type ActionType = 'delete' | 'activate' | 'deactivate';

// ─── Dialog prop interfaces ───────────────────────────────────────────────────

export interface TenantOption {
  value: string;
  label: string;
}

export interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: TenantOption[];
}

export interface InviteAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: TenantOption[];
}

export interface EditAdminDialogProps {
  admin: TenantAdminDto | null;
  tenantAddress: AddressDto | null;
  onClose: () => void;
}

export interface ViewAdminDialogProps {
  admin: TenantAdminDto | null;
  onClose: () => void;
}

// ─── Section sub-component prop interfaces ────────────────────────────────────

export interface TenantAdminsPageHeaderProps {
  canCreate: boolean;
  canInvite: boolean;
  onCreateClick: () => void;
  onInviteClick: () => void;
}

export interface TenantAdminsFilterBarProps {
  adminsFilterFields: import('mui-schema-form-builder').FieldConfig[];
  defaultValues: { search: string; tenant: string; status: string; createdVia: string };
  onChange: (values: Record<string, unknown>) => void;
}

export interface TenantAdminsInvitationsFilterBarProps {
  adminsInvFilterFields: import('mui-schema-form-builder').FieldConfig[];
  defaultValues: { status: string };
  onChange: (values: Record<string, unknown>) => void;
}

// ─── Re-export api types used across this page ────────────────────────────────
export type { TenantAdminDto, TenantAdminInvitationDto, AddressDto };
