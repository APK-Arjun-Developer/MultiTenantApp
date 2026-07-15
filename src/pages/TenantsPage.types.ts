import type { TenantDto, TenantCreationInvitationDto, FilterValues } from '@/types/api';

export interface OnboardDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface EditDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

export interface ViewTenantDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

export interface ChangePlanDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

export interface TenantsPageHeaderProps {
  canCreate: boolean;
  onInviteClick: () => void;
  onOnboardClick: () => void;
}

export interface TenantsPageFilterBarProps {
  onChange: (values: FilterValues) => void;
}

export interface TenantsInvitationsFilterBarProps {
  onChange: (values: FilterValues) => void;
}

export type { TenantDto, TenantCreationInvitationDto };
