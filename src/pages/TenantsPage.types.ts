import type { FilterValues, TenantCreationInvitationDto, TenantDto } from '@/types/api';

interface OnboardDialogProps {
  open: boolean;
  onClose: () => void;
}

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

interface EditDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

interface ViewTenantDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

interface ChangePlanDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

interface TenantsPageHeaderProps {
  canCreate: boolean;
  onInviteClick: () => void;
  onOnboardClick: () => void;
}

interface TenantsPageFilterBarProps {
  onChange: (values: FilterValues) => void;
}

interface TenantsInvitationsFilterBarProps {
  onChange: (values: FilterValues) => void;
}

export type {
  ChangePlanDialogProps,
  EditDialogProps,
  InviteDialogProps,
  OnboardDialogProps,
  TenantCreationInvitationDto,
  TenantDto,
  TenantsInvitationsFilterBarProps,
  TenantsPageFilterBarProps,
  TenantsPageHeaderProps,
  ViewTenantDialogProps,
};
