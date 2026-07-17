import { memo, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { FIELD_TYPE, type FieldConfig, FormBuilder } from 'mui-schema-form-builder';

import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
} from '@/features/tenantSettings/api/tenantSettingsApi';
import { Icon, LoadingButton } from '@/shared/components';
import { buildAddressPayload, getAddressFields } from '@/shared/forms/addressFields';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

import { styles } from './TenantSettingsPage.styles';
import {
  settingsSchema,
  type SettingsValues,
  type TenantSettingsFormProps,
} from './TenantSettingsPage.types';

const TenantSettingsForm = memo(
  ({ tenantId, fields, isSaving, onSubmit }: TenantSettingsFormProps) => {
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
        sx={styles.formCard}
      />
    );
  },
);

const TenantSettingsPage = memo(() => {
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
          <Icon name="Settings" sx={styles.pageIconSize} />
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
export default TenantSettingsPage;
