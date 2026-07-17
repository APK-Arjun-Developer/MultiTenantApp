import type { FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import { addressZodShape } from '@/shared/forms/addressFields';

const settingsSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(200),
  ...addressZodShape,
});

type SettingsValues = z.infer<typeof settingsSchema>;

interface TenantSettingsFormProps {
  tenantId: string | undefined;
  fields: FieldConfig[];
  isSaving: boolean;
  onSubmit: (values: SettingsValues) => Promise<void>;
}

export { settingsSchema, type SettingsValues, type TenantSettingsFormProps };
