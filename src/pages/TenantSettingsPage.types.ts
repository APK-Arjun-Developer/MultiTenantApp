import { z } from 'zod';
import { addressZodShape } from '@/shared/forms/addressFields';
import type { FieldConfig } from 'mui-schema-form-builder';

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
  fields: FieldConfig[];
  isSaving: boolean;
  onSubmit: (values: SettingsValues) => Promise<void>;
}
