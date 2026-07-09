import { useMemo } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import {
  addressZodShape,
  getAddressFields,
  buildAddressPayload,
} from '@/shared/forms/addressFields';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
} from '@/features/tenantSettings/api/tenantSettingsApi';
import type { ApiError } from '@/types/api';

const settingsSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(200),
  ...addressZodShape,
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function TenantSettingsPage() {
  const snackbar = useSnackbar();
  const { data: tenant, isLoading } = useGetTenantSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateTenantSettingsMutation();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Company name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: tenant?.name ?? '',
        section: 'General',
        muiProps: { autoFocus: true },
      },
      ...getAddressFields(tenant?.address, 'Address'),
    ],
    [tenant],
  );

  const onSubmit = async (values: SettingsValues) => {
    try {
      await updateSettings({
        name: values.name,
        ...buildAddressPayload(values),
      }).unwrap();
      snackbar.success('Settings saved.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to save settings.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tenant Settings
        </Typography>
      </Box>

      <FormBuilder
        key={tenant?.id}
        schema={settingsSchema}
        fields={fields}
        onSubmit={onSubmit}
        renderActions={({ isSubmitting }) => (
          <LoadingButton
            type="submit"
            loading={isSubmitting || isSaving}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Save changes
          </LoadingButton>
        )}
        sx={{ boxShadow: 1 }}
      />
    </Box>
  );
}
