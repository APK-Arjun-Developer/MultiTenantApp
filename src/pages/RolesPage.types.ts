import type { FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import type { FilterValues, RoleDto } from '@/types/api';

const permissionOptionSchema = z.union([
  z.string(),
  z.object({ value: z.string(), label: z.string() }),
]);

const createSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(permissionOptionSchema).min(1, 'At least one permission is required'),
});
type CreateValues = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(permissionOptionSchema).min(1, 'At least one permission is required'),
});
type EditValues = z.infer<typeof editSchema>;

interface PermissionOption {
  value: string;
  label: string;
}

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  permissionOptions: PermissionOption[];
}

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: RoleDto | null;
  permissionOptions: PermissionOption[];
}

interface ViewRoleDialogProps {
  role: RoleDto | null;
  onClose: () => void;
}

interface RolesPageHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

interface RolesFilterBarProps {
  fields: FieldConfig[];
  onFilterChange: (values: FilterValues) => void;
}

interface RolesFilter extends FilterValues {
  search: string;
  permissions: string[];
}

export {
  type CreateRoleDialogProps,
  createSchema,
  type CreateValues,
  type EditRoleDialogProps,
  editSchema,
  type EditValues,
  type PermissionOption,
  type RolesFilter,
  type RolesFilterBarProps,
  type RolesPageHeaderProps,
  type ViewRoleDialogProps,
};
