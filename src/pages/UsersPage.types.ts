import type { UserDto, UserInvitationDto } from '@/types/api';
import { z } from 'zod';
import { requiredAddressZodShape, addressZodShape } from '@/shared/forms/addressFields';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
  roleIds: z.array(z.any()).min(1, 'At least one role is required'),
  ...requiredAddressZodShape,
});
export type CreateValues = z.infer<typeof createSchema>;

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  roleIds: z.array(z.any()).min(1, 'At least one role is required'),
});
export type InviteValues = z.infer<typeof inviteSchema>;

export const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  roleId: z.string().optional(),
  sameAsCompany: z.boolean().default(false),
  ...addressZodShape,
});
export type EditValues = z.infer<typeof editSchema>;

// ─── Action types ─────────────────────────────────────────────────────────────

export type ActionType = 'delete' | 'activate' | 'deactivate';

export interface PendingAction {
  type: ActionType;
  user: UserDto;
}

// ─── Dialog prop types ────────────────────────────────────────────────────────

export interface RoleOption {
  value: string;
  label: string;
}

export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: RoleOption[];
}

export interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: RoleOption[];
}

export interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserDto | null;
  roleOptions: RoleOption[];
}

export interface ViewUserDialogProps {
  user: UserDto | null;
  onClose: () => void;
}

// ─── Section prop types ───────────────────────────────────────────────────────

export interface UsersPageHeaderProps {
  canCreate: boolean;
  canInvite: boolean;
  atUserLimit: boolean;
  maxUsers: number;
  planName: string | undefined;
  onCreateOpen: () => void;
  onInviteOpen: () => void;
}

export interface UsersPageFilterBarProps {
  userFilterFields: import('mui-schema-form-builder').FieldConfig[];
  defaultValues: { search: string; status: string; createdVia: string };
  onChange: (values: Record<string, unknown>) => void;
}

export interface UsersPageActionsProps {
  exportLoading: boolean;
  hasItems: boolean;
  onExport: () => void;
}

export interface UsersInvitationsFilterBarProps {
  invFilterFields: import('mui-schema-form-builder').FieldConfig[];
  defaultValues: { status: string };
  onChange: (values: Record<string, unknown>) => void;
}

// ─── Re-export consumed types so importers don't need @/types/api ──────────────

export type { UserDto, UserInvitationDto };
