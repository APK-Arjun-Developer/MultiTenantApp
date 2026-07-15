import { z } from 'zod';
import type { FieldConfig } from 'mui-schema-form-builder';
import type { RoleDto, FilterValues } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const permissionOptionSchema = z.union([
  z.string(),
  z.object({ value: z.string(), label: z.string() }),
]);

export const createSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(permissionOptionSchema).min(1, 'At least one permission is required'),
});
export type CreateValues = z.infer<typeof createSchema>;

export const editSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(permissionOptionSchema).min(1, 'At least one permission is required'),
});
export type EditValues = z.infer<typeof editSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PermissionOption {
  value: string;
  label: string;
}

export interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  permissionOptions: PermissionOption[];
}

export interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: RoleDto | null;
  permissionOptions: PermissionOption[];
}

export interface ViewRoleDialogProps {
  role: RoleDto | null;
  onClose: () => void;
}

export interface RolesPageHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

export interface RolesFilterBarProps {
  fields: FieldConfig[];
  onFilterChange: (values: FilterValues) => void;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface RolesFilter extends FilterValues {
  search: string;
  permissions: string[];
}
