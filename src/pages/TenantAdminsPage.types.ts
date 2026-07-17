import type { FieldConfig } from 'mui-schema-form-builder';

import type { AddressValues, TenantAddressValues } from '@/shared/forms/addressFields';
import type {
  AddressDto,
  FilterValues,
  TenantAdminDto,
  TenantAdminInvitationDto,
} from '@/types/api';

// Zod-inferred value shapes
// These mirror the schemas defined in TenantAdminsPage.tsx so sub-components
// can reference them without importing z.infer at every call site.

type CreateValues = { tenantId: string; fullName: string; email: string } & AddressValues;

type InviteValues = {
  tenantId: string;
  email: string;
};

type EditValues = { fullName: string } & AddressValues & TenantAddressValues;

type ActionType = 'delete' | 'activate' | 'deactivate';

interface TenantOption {
  value: string;
  label: string;
}

interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: TenantOption[];
}

interface InviteAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: TenantOption[];
}

interface EditAdminDialogProps {
  admin: TenantAdminDto | null;
  tenantAddress: AddressDto | null;
  onClose: () => void;
}

interface ViewAdminDialogProps {
  admin: TenantAdminDto | null;
  onClose: () => void;
}

interface TenantAdminsPageHeaderProps {
  canCreate: boolean;
  canInvite: boolean;
  onCreateClick: () => void;
  onInviteClick: () => void;
}

interface TenantAdminsFilterBarProps {
  adminsFilterFields: FieldConfig[];
  defaultValues: { search: string; tenant: string; status: string; createdVia: string };
  onChange: (values: FilterValues) => void;
}

interface TenantAdminsInvitationsFilterBarProps {
  adminsInvFilterFields: FieldConfig[];
  defaultValues: { status: string };
  onChange: (values: FilterValues) => void;
}

export type {
  ActionType,
  AddressDto,
  CreateAdminDialogProps,
  CreateValues,
  EditAdminDialogProps,
  EditValues,
  InviteAdminDialogProps,
  InviteValues,
  TenantAdminDto,
  TenantAdminInvitationDto,
  TenantAdminsFilterBarProps,
  TenantAdminsInvitationsFilterBarProps,
  TenantAdminsPageHeaderProps,
  TenantOption,
  ViewAdminDialogProps,
};
