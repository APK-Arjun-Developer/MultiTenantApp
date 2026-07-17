import React, { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectSelectedTenantId,
  selectSelectedTenantName,
  setSelectedTenant,
  clearSelectedTenant,
} from '@/features/ui/uiSlice';
import { apiSlice } from '@/shared/api/apiSlice';
import { useGetTenantsQuery } from '@/features/tenants/api/tenantsApi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { styles } from './TenantPicker.styles';

const PLATFORM_VALUE = '__platform__';

const TenantPicker = React.memo(() => {
  const dispatch = useAppDispatch();
  const selectedTenantId = useAppSelector(selectSelectedTenantId);
  const selectedTenantName = useAppSelector(selectSelectedTenantName);
  const { data, isLoading } = useGetTenantsQuery();

  const tenants = useMemo(() => data?.items ?? [], [data]);

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const value = e.target.value;
      if (value === PLATFORM_VALUE) {
        dispatch(clearSelectedTenant());
        dispatch(apiSlice.util.resetApiState());
      } else {
        const tenant = tenants.find((t) => t.id === value);
        if (tenant) {
          dispatch(setSelectedTenant({ id: tenant.id, name: tenant.name }));
          dispatch(apiSlice.util.resetApiState());
        }
      }
    },
    [dispatch, tenants],
  );

  const renderValue = useCallback(
    (value: string) => (
      <Box sx={styles.renderValueBox}>
        <Typography variant="body2" sx={styles.renderValueText}>
          {value === PLATFORM_VALUE ? 'Select Tenant' : (selectedTenantName ?? value)}
        </Typography>
      </Box>
    ),
    [selectedTenantName],
  );

  if (isLoading) {
    return <CircularProgress size={18} sx={styles.loadingSpinner} />;
  }

  return (
    <FormControl size="small" sx={styles.formControl}>
      <Select
        value={selectedTenantId ?? PLATFORM_VALUE}
        onChange={handleChange}
        displayEmpty
        sx={styles.select}
        renderValue={renderValue}
      >
        {/* <MenuItem value={PLATFORM_VALUE}>
          <Typography variant="body2" color="text.secondary" sx={styles.platformMenuItem}>
            Platform view (all tenants)
          </Typography>
        </MenuItem> */}
        {tenants.map((tenant) => (
          <MenuItem key={tenant.id} value={tenant.id}>
            <Typography variant="body2" sx={styles.tenantMenuItemText}>
              {tenant.name}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
export default TenantPicker;
