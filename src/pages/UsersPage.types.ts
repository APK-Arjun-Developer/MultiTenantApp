import type { FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import { addressZodShape, requiredAddressZodShape } from '@/shared/forms/addressFields';
import type { FilterValues, UserDto, UserInvitationDto } from '@/types/api';

const roleOptionSchema = z.union([z.string(), z.object({ value: z.string(), label: z.string() })]);

const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.email('Invalid email address'),
  roleIds: z.array(roleOptionSchema).min(1, 'At least one role is required'),
  ...requiredAddressZodShape,
});
type CreateValues = z.infer<typeof createSchema>;

const inviteSchema = z.object({
  email: z.email('Invalid email address'),
  roleIds: z.array(roleOptionSchema).min(1, 'At least one role is required'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  roleId: z.string().optional(),
  sameAsCompany: z.boolean().default(false),
  ...addressZodShape,
});
type EditValues = z.infer<typeof editSchema>;

type ActionType = 'delete' | 'activate' | 'deactivate';

interface PendingAction {
  type: ActionType;
  user: UserDto;
}

interface RoleOption {
  value: string;
  label: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: RoleOption[];
}

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: RoleOption[];
}

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserDto | null;
  roleOptions: RoleOption[];
}

interface ViewUserDialogProps {
  user: UserDto | null;
  onClose: () => void;
}

interface UsersPageHeaderProps {
  canCreate: boolean;
  canInvite: boolean;
  atUserLimit: boolean;
  maxUsers: number;
  planName: string | undefined;
  onCreateOpen: () => void;
  onInviteOpen: () => void;
}

interface UsersPageFilterBarProps {
  userFilterFields: FieldConfig[];
  defaultValues: { search: string; status: string; createdVia: string };
  onChange: (values: FilterValues) => void;
}

interface UsersPageActionsProps {
  exportLoading: boolean;
  hasItems: boolean;
  onExport: () => void;
}

interface UsersInvitationsFilterBarProps {
  invFilterFields: FieldConfig[];
  defaultValues: { status: string };
  onChange: (values: FilterValues) => void;
}

export type {
  ActionType,
  CreateUserDialogProps,
  CreateValues,
  EditUserDialogProps,
  EditValues,
  InviteUserDialogProps,
  InviteValues,
  PendingAction,
  RoleOption,
  UserDto,
  UserInvitationDto,
  UsersInvitationsFilterBarProps,
  UsersPageActionsProps,
  UsersPageFilterBarProps,
  UsersPageHeaderProps,
  ViewUserDialogProps,
};

export { createSchema, editSchema, inviteSchema };
