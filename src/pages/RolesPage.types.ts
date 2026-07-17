import { z } from 'zod';
import type { FieldConfig } from 'mui-schema-form-builder';
import type { RoleDto, FilterValues } from '@/types/api';

// â”€â”€â”€ Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface RolesFilter extends FilterValues {
  search: string;
  permissions: string[];
}

export {
  createSchema,
  editSchema,
  type CreateValues,
  type EditValues,
  type PermissionOption,
  type CreateRoleDialogProps,
  type EditRoleDialogProps,
  type ViewRoleDialogProps,
  type RolesPageHeaderProps,
  type RolesFilterBarProps,
  type RolesFilter,
};
