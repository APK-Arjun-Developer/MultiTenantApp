import { z } from 'zod';
import { addressZodShape } from '@/shared/forms/addressFields';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(200),
  ...addressZodShape,
});

// ─── Value types ──────────────────────────────────────────────────────────────

export type SettingsValues = z.infer<typeof settingsSchema>;

// ─── Component prop types ─────────────────────────────────────────────────────

export interface TenantSettingsFormProps {
  tenantId: string | undefined;
  fields: import('mui-schema-form-builder').FieldConfig[];
  isSaving: boolean;
  onSubmit: (values: SettingsValues) => Promise<void>;
}
