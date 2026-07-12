import { memo, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { getAddressFields, buildAddressPayload } from '@/shared/forms/addressFields';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
} from '@/features/tenantSettings/api/tenantSettingsApi';
import type { ApiError } from '@/types/api';
import { styles } from './TenantSettingsPage.styles';
import type { SettingsValues, TenantSettingsFormProps } from './TenantSettingsPage.types';
import { settingsSchema } from './TenantSettingsPage.types';

// ─── Sub-component ────────────────────────────────────────────────────────────

const TenantSettingsForm = memo(function TenantSettingsForm({
  tenantId,
  fields,
  isSaving,
  onSubmit,
}: TenantSettingsFormProps) {
  return (
    <FormBuilder
      key={tenantId}
      schema={settingsSchema}
      fields={fields}
      onSubmit={onSubmit}
      renderActions={({ isSubmitting }) => (
        <LoadingButton
          type="submit"
          loading={isSubmitting || isSaving}
          variant="contained"
          sx={styles.saveButton}
        >
          Save changes
        </LoadingButton>
      )}
      sx={styles.formCard as never}
    />
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TenantSettingsPage = memo(function TenantSettingsPage() {
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

  const onSubmit = useCallback(
    async (values: SettingsValues) => {
      try {
        await updateSettings({
          name: values.name,
          ...buildAddressPayload(values),
        }).unwrap();
        snackbar.success('Settings saved.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to save settings.');
      }
    },
    [updateSettings, snackbar],
  );

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      <Box sx={styles.pageHeader}>
        <Box sx={styles.pageIconBox}>
          <SettingsIcon sx={{ fontSize: '1.125rem' }} />
        </Box>
        <Typography variant="h5" sx={styles.pageTitle}>
          Tenant Settings
        </Typography>
      </Box>

      <TenantSettingsForm
        tenantId={tenant?.id}
        fields={fields}
        isSaving={isSaving}
        onSubmit={onSubmit}
      />
    </Box>
  );
});
