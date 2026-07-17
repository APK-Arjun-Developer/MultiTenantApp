import type { FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import { addressZodShape, requiredAddressZodShape } from '@/shared/forms/addressFields';
import type { FilterValues, UserDto, UserInvitationDto } from '@/types/api';

// â”€â”€â”€ Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Action types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ActionType = 'delete' | 'activate' | 'deactivate';

interface PendingAction {
  type: ActionType;
  user: UserDto;
}

// â”€â”€â”€ Dialog prop types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Section prop types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Re-export consumed types so importers don't need @/types/api â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type { UserDto, UserInvitationDto };

export {
  type ActionType,
  createSchema,
  type CreateUserDialogProps,
  type CreateValues,
  editSchema,
  type EditUserDialogProps,
  type EditValues,
  inviteSchema,
  type InviteUserDialogProps,
  type InviteValues,
  type PendingAction,
  type RoleOption,
  type UsersInvitationsFilterBarProps,
  type UsersPageActionsProps,
  type UsersPageFilterBarProps,
  type UsersPageHeaderProps,
  type ViewUserDialogProps,
};
