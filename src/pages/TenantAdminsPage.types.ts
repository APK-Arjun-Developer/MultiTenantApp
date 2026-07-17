import type { FieldConfig } from 'mui-schema-form-builder';

import type { AddressValues, TenantAddressValues } from '@/shared/forms/addressFields';
import type {
  AddressDto,
  FilterValues,
  TenantAdminDto,
  TenantAdminInvitationDto,
} from '@/types/api';

// â”€â”€â”€ Zod-inferred value shapes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These mirror the schemas defined in TenantAdminsPage.tsx so sub-components
// can reference them without importing z.infer at every call site.

type CreateValues = { tenantId: string; fullName: string; email: string } & AddressValues;

type InviteValues = {
  tenantId: string;
  email: string;
};

type EditValues = { fullName: string } & AddressValues & TenantAddressValues;

// â”€â”€â”€ Action type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ActionType = 'delete' | 'activate' | 'deactivate';

// â”€â”€â”€ Dialog prop interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Section sub-component prop interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Re-export api types used across this page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type { AddressDto, TenantAdminDto, TenantAdminInvitationDto };

export {
  type ActionType,
  type CreateAdminDialogProps,
  type CreateValues,
  type EditAdminDialogProps,
  type EditValues,
  type InviteAdminDialogProps,
  type InviteValues,
  type TenantAdminsFilterBarProps,
  type TenantAdminsInvitationsFilterBarProps,
  type TenantAdminsPageHeaderProps,
  type TenantOption,
  type ViewAdminDialogProps,
};
