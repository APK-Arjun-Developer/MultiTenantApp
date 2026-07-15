import type {
  TenantAdminDto,
  TenantAdminInvitationDto,
  AddressDto,
  FilterValues,
} from '@/types/api';
import type { FieldConfig } from 'mui-schema-form-builder';
import type { AddressValues, TenantAddressValues } from '@/shared/forms/addressFields';

// ─── Zod-inferred value shapes ────────────────────────────────────────────────
// These mirror the schemas defined in TenantAdminsPage.tsx so sub-components
// can reference them without importing z.infer at every call site.

export type CreateValues = { tenantId: string; fullName: string; email: string } & AddressValues;

export type InviteValues = {
  tenantId: string;
  email: string;
};

export type EditValues = { fullName: string } & AddressValues & TenantAddressValues;

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
  adminsFilterFields: FieldConfig[];
  defaultValues: { search: string; tenant: string; status: string; createdVia: string };
  onChange: (values: FilterValues) => void;
}

export interface TenantAdminsInvitationsFilterBarProps {
  adminsInvFilterFields: FieldConfig[];
  defaultValues: { status: string };
  onChange: (values: FilterValues) => void;
}

// ─── Re-export api types used across this page ────────────────────────────────
export type { TenantAdminDto, TenantAdminInvitationDto, AddressDto };
