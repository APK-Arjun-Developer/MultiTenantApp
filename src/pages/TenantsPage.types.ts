import type { TenantDto, TenantCreationInvitationDto } from '@/types/api';

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
  onChange: (values: Record<string, unknown>) => void;
}

export interface TenantsInvitationsFilterBarProps {
  onChange: (values: Record<string, unknown>) => void;
}

export type { TenantDto, TenantCreationInvitationDto };
